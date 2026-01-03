import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, Users, PlusCircle, Search, Phone, Mail, Car, Calendar, 
  CheckCircle, XCircle, MessageSquare, UserPlus, BarChart3, ChevronRight, 
  Clock, UserCog, LogOut, Target, Menu, X, Send, MapPin, Activity, 
  Archive, Star, Upload, Download, Trash2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { initializeApp } from "firebase/app";
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken 
} from "firebase/auth";
import { 
  getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, 
  query, serverTimestamp, deleteDoc 
} from "firebase/firestore";

// --- CONFIGURACIÓN Y CONSTANTES ---
const getFirebaseConfig = () => {
  if (typeof __firebase_config !== 'undefined') return JSON.parse(__firebase_config);
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
};

const app = initializeApp(getFirebaseConfig());
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = 'honda-crm-v1';

const ADVISORS = [
  { id: 'adv1', name: 'Alejandro Hurtado', color: '#3B82F6' },
  { id: 'adv2', name: 'Triana Montes', color: '#10B981' },
  { id: 'adv3', name: 'Jonathan Rodriguez', color: '#F59E0B' },
  { id: 'adv4', name: 'Lucy Figueroa', color: '#8B5CF6' },
  { id: 'adv5', name: 'Giovanni Gonzalez', color: '#EC4899' }
];

// 1. Estados actualizados: Incluye "Contacto Exitoso" y "Número Inválido" 
const STATUS_FLOW = [
  { key: 'new', label: 'Nuevo', color: 'bg-blue-100 text-blue-800' },
  { key: 'contacted', label: 'Contactado', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'success_contact', label: 'Contacto Exitoso', color: 'bg-emerald-100 text-emerald-800' },
  { key: 'invalid_number', label: 'Número Inválido', color: 'bg-slate-200 text-slate-600' },
  { key: 'appointment', label: 'Cita Agendada', color: 'bg-purple-100 text-purple-800' },
  { key: 'visit', label: 'Visita Showroom', color: 'bg-orange-100 text-orange-800' },
  { key: 'negotiation', label: 'Negociación', color: 'bg-indigo-100 text-indigo-800' },
  { key: 'sold', label: 'Vendido', color: 'bg-green-100 text-green-800' },
  { key: 'lost', label: 'Perdido', color: 'bg-red-100 text-red-800' }
];

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#64748B', '#8B5CF6', '#F97316', '#6366F1', '#22C55E', '#EF4444'];

const SOURCES = [
  { id: 'hdm', label: 'HDM (Honda Digital)', color: 'text-blue-600 bg-blue-50' },
  { id: 'redes', label: 'Redes Sociales', color: 'text-pink-600 bg-pink-50' },
  { id: 'prospeccion', label: 'Prospección', color: 'text-emerald-600 bg-emerald-50' },
  { id: 'piso', label: 'Piso / Showroom', color: 'text-purple-600 bg-purple-50' },
  { id: 'whatsapp', label: 'WhatsApp', color: 'text-green-600 bg-green-50' }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('supervisor'); // Autenticación simulada 

  // --- EFECTOS (FIREBASE) ---
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', APP_ID, 'public', 'data', 'leads'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setLeads(data.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    });
  }, [user]);

  // --- LÓGICA DE NEGOCIO ---
  const isAdmin = currentUserId === 'supervisor';

  const handleUpdateStatus = async (leadId, newStatus, comment) => {
    const lead = leads.find(l => l.id === leadId);
    
    // Regla de 8 intentos para archivar como perdido 
    if (newStatus === 'lost' && (lead.attempts || 0) < 8) {
      alert("Se requieren al menos 8 intentos registrados para marcar como Perdido.");
      return;
    }

    const updates = {
      status: newStatus,
      // Los vendidos ya no se archivan automáticamente 
      isArchived: newStatus === 'lost', 
      history: [...(lead.history || []), {
        type: 'status_change',
        text: `Estado cambiado a ${newStatus}. Nota: ${comment}`,
        date: new Date().toISOString(),
        user: isAdmin ? 'Supervisor' : lead.advisorName
      }]
    };
    await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'leads', leadId), updates);
    setSelectedLead(null);
  };

  const handleAddAttempt = async (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    const newAttempts = (lead.attempts || 0) + 1;
    await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'leads', leadId), {
      attempts: newAttempts,
      history: [...(lead.history || []), {
        type: 'comment',
        text: `Intento de contacto #${newAttempts}`,
        date: new Date().toISOString(),
        user: 'Sistema'
      }]
    });
  };

  const handleDeleteLead = async (leadId) => {
    if (!isAdmin) return alert("Solo administradores pueden borrar leads."); // 
    if (window.confirm("¿Eliminar definitivamente?")) {
      await deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'leads', leadId));
      setSelectedLead(null);
    }
  };

  // --- RENDERIZADO ---
  const visibleLeads = useMemo(() => 
    leads.filter(l => !l.isArchived && (isAdmin || l.advisorId === currentUserId)),
    [leads, isAdmin, currentUserId]
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Simple */}
      <aside className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col">
        <h1 className="text-xl font-bold mb-8 flex items-center gap-2"><Car /> Honda CRM</h1>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex p-3 rounded ${activeTab === 'dashboard' ? 'bg-blue-600' : ''}`}>Dashboard</button>
          <button onClick={() => setActiveTab('leads')} className={`w-full flex p-3 rounded ${activeTab === 'leads' ? 'bg-blue-600' : ''}`}>Clientes</button>
        </nav>
        <div className="mt-auto p-4 bg-slate-800 rounded">
          <p className="text-xs text-slate-400">Sesión como:</p>
          <select value={currentUserId} onChange={e => setCurrentUserId(e.target.value)} className="bg-transparent text-sm w-full outline-none">
            <option value="supervisor">Administrador</option>
            {ADVISORS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === 'dashboard' ? (
          <DashboardView leads={visibleLeads} />
        ) : (
          <LeadsListView 
            leads={visibleLeads} 
            onSelect={setSelectedLead} 
            isAdmin={isAdmin}
          />
        )}
      </main>

      {selectedLead && (
        <LeadModal 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdateStatus}
          onAttempt={() => handleAddAttempt(selectedLead.id)}
          onDelete={() => handleDeleteLead(selectedLead.id)}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

// --- SUBCOMPONENTES ---

const DashboardView = ({ leads }) => {
  const data = STATUS_FLOW.map(s => ({
    name: s.label,
    value: leads.filter(l => l.status === s.key).length
  })).filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Resumen de Ventas</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border h-96">
        <h3 className="font-semibold mb-4 text-slate-500">Distribución del Embudo (Pie Chart)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const LeadsListView = ({ leads, onSelect, isAdmin }) => {
  const [filterSource, setFilterSource] = useState('all');

  const filtered = leads.filter(l => filterSource === 'all' || l.source === filterSource);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <select onChange={e => setFilterSource(e.target.value)} className="p-2 border rounded-lg bg-white shadow-sm">
          <option value="all">Todos los orígenes</option>
          {SOURCES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-sm border divide-y">
        {filtered.map(lead => (
          <div key={lead.id} onClick={() => onSelect(lead)} className="p-4 hover:bg-slate-50 cursor-pointer flex justify-between items-center">
            <div>
              <p className="font-bold text-lg">{lead.name}</p>
              <div className="flex gap-2 text-xs items-center mt-1">
                <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 uppercase font-bold">{lead.source}</span>
                <span className="text-slate-400">
                  {/* Hora de llegada basada en timestamp  */}
                  {lead.createdAt.toLocaleDateString()} {lead.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_FLOW.find(s => s.key === lead.status)?.color}`}>
                {STATUS_FLOW.find(s => s.key === lead.status)?.label}
              </span>
              <span className="text-xs text-blue-600 font-medium">Intentos: {lead.attempts || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LeadModal = ({ lead, onClose, onUpdate, onAttempt, onDelete, isAdmin }) => {
  const [comment, setComment] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-6">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold">{lead.name}</h2>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="flex gap-4">
          <button onClick={onAttempt} className="flex-1 bg-blue-50 text-blue-700 p-3 rounded-lg flex items-center justify-center gap-2 font-bold border border-blue-200">
            <Phone size={18} /> Registrar Intento ({lead.attempts || 0})
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 uppercase">Cambiar Estado</label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_FLOW.map(s => (
              <button key={s.key} onClick={() => onUpdate(lead.id, s.key, comment)} className={`p-2 text-xs rounded border text-left ${lead.status === s.key ? 'border-blue-500 bg-blue-50' : ''}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Solo administradores pueden borrar o reasignar  */}
        {isAdmin && (
          <div className="pt-4 border-t flex justify-between">
            <button className="text-slate-500 text-sm flex items-center gap-1"><UserCog size={16}/> Reasignar</button>
            <button onClick={onDelete} className="text-red-500 text-sm flex items-center gap-1"><Trash2 size={16}/> Borrar Lead</button>
          </div>
        )}
      </div>
    </div>
  );
};