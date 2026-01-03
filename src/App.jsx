import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  Search, 
  Phone, 
  Mail, 
  Car, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  UserPlus,
  BarChart3,
  ChevronRight,
  Clock,
  UserCog,
  LogOut,
  Target,
  Menu,
  X,
  Send,
  MapPin,
  Activity,
  Archive,
  Star,
  Upload,
  Download,
  Trash2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithCustomToken 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  query, 
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";

const getFirebaseConfig = () => {
  if (typeof __firebase_config !== 'undefined') {
    return JSON.parse(__firebase_config);
  }
  
  // En producción, usar variables de entorno (configuradas en Netlify)
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };
  
  // Validar que las variables estén configuradas
  if (!config.apiKey || !config.projectId) {
    console.error('Firebase config missing. Please set environment variables in Netlify.');
    console.error('Required: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, etc.');
  }
  
  
  return config;
};

const config = getFirebaseConfig();
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'honda-crm-v1';
import NavButton from './components/atoms/NavButton';
import DashboardView from './components/organisms/DashboardView';
import LeadsListView from './components/organisms/LeadsListView';
import FavoritesView from './components/organisms/FavoritesView';
import ArchiveView from './components/organisms/ArchiveView';
import NewLeadForm from './components/organisms/NewLeadForm';
import LeadDetailModal from './components/organisms/LeadDetailModal';
import { ADVISORS, STATUS_FLOW, SOURCES, MODELS } from './components/constants';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState('supervisor');

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setError("Error de autenticación. Recarga la página.");
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const leadsCollection = collection(db, 'artifacts', APP_ID, 'public', 'data', 'leads');
    const q = query(leadsCollection);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          entryDate: data.entryDate ? new Date(data.entryDate) : (data.createdAt?.toDate ? data.createdAt.toDate() : new Date()),
          isFavorite: data.isFavorite || false,
          isArchived: data.isArchived || false
        };
      });
      
      leadsData.sort((a, b) => b.createdAt - a.createdAt);
      setLeads(leadsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching leads:", err);
      setError("Error cargando leads. Verifica tu conexión.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getNextAdvisor = () => {
    const counts = {};
    ADVISORS.forEach(adv => counts[adv.id] = 0);
    leads.forEach(lead => {
      if (counts[lead.advisorId] !== undefined && lead.status !== 'sold' && lead.status !== 'lost' && !lead.isArchived) {
        counts[lead.advisorId]++;
      }
    });

    let selectedAdvisor = ADVISORS[0];
    let minCount = Infinity;

    ADVISORS.forEach(adv => {
      if (counts[adv.id] < minCount) {
        minCount = counts[adv.id];
        selectedAdvisor = adv;
      }
    });
    return selectedAdvisor;
  };

  const handleAddLead = async (formData) => {
    if (!user) return;
    
    let advisorToAssign;
    const isSupervisor = currentUserId === 'supervisor';

    if (isSupervisor) {
      if (formData.manualAdvisorId && formData.manualAdvisorId !== 'auto') {
        advisorToAssign = ADVISORS.find(a => a.id === formData.manualAdvisorId);
      } else {
        advisorToAssign = getNextAdvisor();
      }
    } else {
      advisorToAssign = ADVISORS.find(a => a.id === currentUserId);
    }
    
    if (!advisorToAssign) advisorToAssign = ADVISORS[0];

    try {
      const leadsCollection = collection(db, 'artifacts', APP_ID, 'public', 'data', 'leads');
      await addDoc(leadsCollection, {
        ...formData,
        advisorId: advisorToAssign.id,
        advisorName: advisorToAssign.name,
        status: 'new',
        createdAt: serverTimestamp(),
        entryDate: formData.entryDate || new Date().toISOString(),
        isFavorite: false,
        isArchived: false,
        authorId: user.uid,
        history: [{
          type: 'system',
          text: `Lead creado (${formData.source}) y asignado a ${advisorToAssign.name}`,
          date: new Date().toISOString()
        }]
      });
      setActiveTab('leads');
    } catch (err) {
      console.error("Error adding lead:", err);
      alert("Error al guardar. Intenta nuevamente.");
    }
  };

  const handleUpdateStatus = async (leadId, newStatus, comment) => {
    if (!user) return;
    try {
      const leadRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'leads', leadId);
      const oldLead = leads.find(l => l.id === leadId);
      const currentUserObj = ADVISORS.find(a => a.id === currentUserId);
      const userName = currentUserId === 'supervisor' ? 'Supervisor' : (currentUserObj?.name || 'Agente');
      
      const newHistoryEntry = {
        type: 'status_change',
        text: `Cambio de ${oldLead.status} a ${newStatus}. Nota: ${comment}`,
        date: new Date().toISOString(),
        user: userName
      };

      const updates = {
        status: newStatus,
        history: [...(oldLead.history || []), newHistoryEntry]
      };

      // Auto-archivar si es perdido o vendido hace más de 30 días
      if (newStatus === 'lost' || newStatus === 'sold') {
        updates.isArchived = true;
      }

      await updateDoc(leadRef, updates);
      setSelectedLead(null);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleAddComment = async (leadId, comment) => {
    if (!user) return;
    try {
      const leadRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'leads', leadId);
      const oldLead = leads.find(l => l.id === leadId);
      const currentUserObj = ADVISORS.find(a => a.id === currentUserId);
      const userName = currentUserId === 'supervisor' ? 'Supervisor' : (currentUserObj?.name || 'Agente');

      const newHistoryEntry = {
        type: 'comment',
        text: comment,
        date: new Date().toISOString(),
        user: userName
      };

      await updateDoc(leadRef, {
        history: [...(oldLead.history || []), newHistoryEntry]
      });
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!user) return;
    
    if (!window.confirm('¿Estás seguro de eliminar este lead? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      const leadRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'leads', leadId);
      await deleteDoc(leadRef);
      setSelectedLead(null);
    } catch (err) {
      console.error("Error deleting lead:", err);
      alert("Error al eliminar. Intenta nuevamente.");
    }
  };

  const handleToggleFavorite = async (leadId) => {
    if (!user) return;
    try {
      const leadRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'leads', leadId);
      const lead = leads.find(l => l.id === leadId);
      await updateDoc(leadRef, {
        isFavorite: !lead.isFavorite
      });
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const handleToggleArchive = async (leadId) => {
    if (!user) return;
    try {
      const leadRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'leads', leadId);
      const lead = leads.find(l => l.id === leadId);
      await updateDoc(leadRef, {
        isArchived: !lead.isArchived
      });
    } catch (err) {
      console.error("Error toggling archive:", err);
    }
  };

  const handleImportCSV = async (file) => {
    if (!user || !file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const leadsCollection = collection(db, 'artifacts', APP_ID, 'public', 'data', 'leads');
        let imported = 0;
        let errors = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const leadData = {};
          
          headers.forEach((header, idx) => {
            leadData[header] = values[idx] || '';
          });

          // Detectar asesor del CSV
          let advisor = null;
          const advisorFromCSV = leadData.asesor || leadData.advisor || leadData.advisorname || leadData.asesorname;
          
          if (advisorFromCSV) {
            // Buscar por nombre completo o parcial
            advisor = ADVISORS.find(a => 
              a.name.toLowerCase().includes(advisorFromCSV.toLowerCase()) ||
              advisorFromCSV.toLowerCase().includes(a.name.toLowerCase().split(' ')[0].toLowerCase())
            );
            
            // Si no se encuentra, buscar por ID
            if (!advisor) {
              advisor = ADVISORS.find(a => a.id === advisorFromCSV);
            }
          }
          
          // Si no hay asesor en CSV o no se encontró, asignar automáticamente
          if (!advisor) {
            advisor = getNextAdvisor();
          }
          
          try {
            await addDoc(leadsCollection, {
              name: leadData.nombre || leadData.name || 'Sin nombre',
              email: leadData.email || leadData.correo || '',
              phone: leadData.telefono || leadData.phone || leadData.teléfono || '',
              modelInterest: leadData.modelo || leadData.model || MODELS[0],
              source: leadData.fuente || leadData.source || 'prospeccion',
              advisorId: advisor.id,
              advisorName: advisor.name,
              status: leadData.status || leadData.estatus || 'new',
              entryDate: leadData.fecha || leadData.date || new Date().toISOString(),
              createdAt: serverTimestamp(),
              isFavorite: false,
              isArchived: true,
              authorId: user.uid,
              history: [{
                type: 'system',
                text: `Lead importado desde CSV${advisorFromCSV ? ` - Asesor original: ${advisorFromCSV}` : ''}`,
                date: new Date().toISOString()
              }]
            });
            imported++;
          } catch (err) {
            errors.push(`Línea ${i + 1}: ${leadData.nombre || 'Sin nombre'} - ${err.message}`);
          }
        }

        if (errors.length > 0) {
          alert(`⚠️ ${imported} leads importados. ${errors.length} errores:\n${errors.slice(0, 3).join('\n')}`);
        } else {
          alert(`✅ ${imported} leads importados exitosamente al archivo`);
        }
        setActiveTab('archive');
      } catch (err) {
        console.error("Error importing CSV:", err);
        alert("Error al importar CSV. Verifica el formato del archivo.");
      }
    };
    reader.readAsText(file);
  };

  const visibleLeads = useMemo(() => {
    if (currentUserId === 'supervisor') return leads.filter(l => !l.isArchived);
    return leads.filter(l => l.advisorId === currentUserId && !l.isArchived);
  }, [leads, currentUserId]);

  const archivedLeads = useMemo(() => {
    if (currentUserId === 'supervisor') return leads.filter(l => l.isArchived);
    return leads.filter(l => l.advisorId === currentUserId && l.isArchived);
  }, [leads, currentUserId]);

  const favoriteLeads = useMemo(() => {
    if (currentUserId === 'supervisor') return leads.filter(l => l.isFavorite && !l.isArchived);
    return leads.filter(l => l.advisorId === currentUserId && l.isFavorite && !l.isArchived);
  }, [leads, currentUserId]);

  const currentUserData = useMemo(() => {
    if (currentUserId === 'supervisor') return { name: 'Supervisor General', role: 'Gerencia' };
    const adv = ADVISORS.find(a => a.id === currentUserId);
    return adv ? { name: adv.name, role: 'Asesor de Ventas' } : { name: 'Usuario', role: 'Ventas' };
  }, [currentUserId]);

  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
        <div className="animate-spin text-blue-600"><Activity size={32}/></div>
        <p>Conectando con CRM...</p>
      </div>
    );

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView leads={visibleLeads} isSupervisor={currentUserId === 'supervisor'} />;
      case 'leads':
        return <LeadsListView leads={visibleLeads} onSelect={setSelectedLead} onToggleFavorite={handleToggleFavorite} onToggleArchive={handleToggleArchive} isSupervisor={currentUserId === 'supervisor'} />;
      case 'favorites':
        return <FavoritesView leads={favoriteLeads} onSelect={setSelectedLead} onToggleFavorite={handleToggleFavorite} />;
      case 'archive':
        return <ArchiveView leads={archivedLeads} onSelect={setSelectedLead} onToggleArchive={handleToggleArchive} onImportCSV={handleImportCSV} />;
      case 'new-lead':
        return (
          <NewLeadForm 
            onSubmit={handleAddLead} 
            onCancel={() => setActiveTab('leads')} 
            isSupervisor={currentUserId === 'supervisor'}
            currentUserData={currentUserData}
          />
        );
      default:
        return <DashboardView leads={visibleLeads} isSupervisor={currentUserId === 'supervisor'} />;
    }
  };

  return (
    <>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
        .safe-area-pb { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
      
      <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
        
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside className={`
          fixed md:relative inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col shadow-xl z-30 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-6 border-b border-slate-700 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Car size={28} />
                <h1 className="text-xl font-bold tracking-tight text-white">Honda App</h1>
              </div>
              <p className="text-xs text-slate-400">CRM Móvil</p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavButton 
              active={activeTab === 'dashboard'} 
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
            />
            <NavButton 
              active={activeTab === 'leads'} 
              onClick={() => { setActiveTab('leads'); setIsSidebarOpen(false); }} 
              icon={<Users size={20} />} 
              label="Mis Clientes" 
            />
            <NavButton 
              active={activeTab === 'favorites'} 
              onClick={() => { setActiveTab('favorites'); setIsSidebarOpen(false); }} 
              icon={<Star size={20} />} 
              label="Favoritos" 
            />
            <NavButton 
              active={activeTab === 'archive'} 
              onClick={() => { setActiveTab('archive'); setIsSidebarOpen(false); }} 
              icon={<Archive size={20} />} 
              label="Archivo" 
            />
            <div className="h-4"></div>
            <NavButton 
              active={activeTab === 'new-lead'} 
              onClick={() => { setActiveTab('new-lead'); setIsSidebarOpen(false); }} 
              icon={<UserPlus size={20} />} 
              label="Registrar Lead" 
              primary
            />
          </nav>

          <div className="p-4 bg-slate-800 border-t border-slate-700 safe-area-pb">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${currentUserId === 'supervisor' ? 'bg-blue-600' : 'bg-emerald-500'}`}>
                {currentUserData.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{currentUserData.name}</p>
                <p className="text-xs text-slate-400 truncate">{currentUserData.role}</p>
              </div>
            </div>
            
            <select 
              value={currentUserId}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="w-full bg-slate-900 text-slate-300 text-xs py-2 px-3 rounded border border-slate-700 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="supervisor">Vista: Supervisor</option>
              <optgroup label="Asesores">
                {ADVISORS.map(adv => (
                  <option key={adv.id} value={adv.id}>{adv.name}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-50">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-10 sticky top-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Menu size={24} />
              </button>
              <h2 className="text-lg font-semibold text-slate-800 capitalize truncate">
                {activeTab === 'new-lead' ? 'Nuevo' : 
                 activeTab === 'dashboard' ? 'Tablero' : 
                 activeTab === 'favorites' ? 'Favoritos' :
                 activeTab === 'archive' ? 'Archivo' : 'Clientes'}
              </h2>
              {currentUserId !== 'supervisor' && (
                <span className="hidden sm:inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium border border-emerald-200">
                  Personal
                </span>
              )}
            </div>
            {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            {renderContent()}
          </div>

          {selectedLead && (
            <LeadDetailModal 
              lead={selectedLead} 
              onClose={() => setSelectedLead(null)} 
              onUpdateStatus={handleUpdateStatus}
              onAddComment={handleAddComment}
              onDeleteLead={handleDeleteLead}
              onToggleFavorite={handleToggleFavorite}
              onToggleArchive={handleToggleArchive}
              currentUserRole={currentUserId === 'supervisor' ? 'Supervisor' : 'Asesor'}
            />
          )}
        </main>
      </div>
    </>
  );
}

 