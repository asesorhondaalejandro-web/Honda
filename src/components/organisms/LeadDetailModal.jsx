import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Star, MessageSquare, Clock, CheckCircle, Archive, Phone, Send } from 'lucide-react';
import { STATUS_FLOW, SOURCES } from '../constants';

const LeadDetailModal = ({ lead, onClose, onUpdateStatus, onAddComment, onDeleteLead, onToggleFavorite, onToggleArchive, currentUserRole }) => {
  const [comment, setComment] = useState('');
  const [newStatus, setNewStatus] = useState(lead.status);
  const sourceConfig = SOURCES.find(s => s.id === lead.source) || SOURCES[0];
  const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';

  const historyRef = useRef(null);
  useEffect(() => {
    if(historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [lead.history]);

  const handleStatusSubmit = () => {
    if (newStatus !== lead.status) {
      onUpdateStatus(lead.id, newStatus, comment || 'Cambio de estatus rápido');
      setComment('');
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if(comment.trim()) {
      onAddComment(lead.id, comment);
      setComment('');
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full md:max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        <div className="p-4 md:p-6 border-b border-slate-200 bg-slate-50 relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-2">
            <X size={24} />
          </button>
          <button 
            onClick={() => onDeleteLead(lead.id)} 
            className="absolute right-14 top-4 text-red-400 hover:text-red-600 p-2"
            title="Eliminar lead"
          >
            <Trash2 size={24} />
          </button>
          
          <div className="pr-24">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${sourceConfig.color}`}>
                {sourceConfig.label}
              </span>
              <button
                onClick={() => onToggleFavorite(lead.id)}
                className="p-1"
              >
                <Star size={16} className={lead.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-slate-300"} />
              </button>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 truncate">{lead.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
               <span>{lead.modelInterest}</span>
               <span className="w-1 h-1 rounded-full bg-slate-300"></span>
               <span>{lead.phone}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ingreso: {(() => {
                // Si ya es un objeto Date
                if (lead.entryDate instanceof Date) {
                  return lead.entryDate.toLocaleDateString();
                }

                // Si es un string tipo "2025-09-15"
                if (typeof lead.entryDate === 'string' && lead.entryDate.includes('-')) {
                  const [year, month, day] = lead.entryDate.split('-').map(Number);
                  // El mes en JS empieza en 0 (Enero es 0, Septiembre es 8)
                  const dateObj = new Date(year, month - 1, day);
                  return dateObj.toLocaleDateString();
                }
              
                // Fallback para otros formatos
                const fallbackDate = new Date(lead.entryDate);
                return isNaN(fallbackDate.getTime()) ? "Fecha inválida" : fallbackDate.toLocaleDateString();
              })()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <a 
              href={`https://wa.me/${cleanPhone}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-500 text-white font-medium shadow-sm hover:bg-green-600 transition-colors"
            >
              <MessageSquare size={18} /> WhatsApp
            </a>
            <a 
              href={`tel:${cleanPhone}`} 
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-500 text-white font-medium shadow-sm hover:bg-blue-600 transition-colors"
            >
              <Phone size={18} /> Llamar
            </a>
          </div>
        </div>

        <div className="p-4 bg-white border-b border-slate-100">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Estatus Actual</label>
          <div className="flex gap-2">
            <select 
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex-1 p-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              {STATUS_FLOW.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <button 
              onClick={handleStatusSubmit}
              disabled={newStatus === lead.status}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ok
            </button>
          </div>
          
          {!lead.isArchived && (
            <button
              onClick={() => onToggleArchive(lead.id)}
              className="w-full mt-3 py-2 text-sm text-slate-600 hover:text-slate-800 flex items-center justify-center gap-2 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <Archive size={16} />
              Archivar Lead
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50" ref={historyRef}>
          <div className="space-y-5 pb-4">
            {lead.history && lead.history.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    item.type === 'system' ? 'bg-slate-200 text-slate-500' :
                    item.type === 'status_change' ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {item.type === 'system' ? <Clock size={14}/> : 
                     item.type === 'status_change' ? <CheckCircle size={14}/> : 
                     <MessageSquare size={14}/>}
                  </div>
                  {idx < lead.history.length - 1 && <div className="w-0.5 h-full bg-slate-200 mt-2"></div>}
                </div>
                <div className="pb-2 flex-1">
                  <div className="text-[10px] text-slate-400 mb-1 flex justify-between">
                    <span>{item.user || 'Sistema'}</span>
                    <span>{new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className={`p-3 rounded-lg text-sm ${
                    item.type === 'system' ? 'bg-white border border-slate-200 text-slate-500 italic' :
                    item.type === 'status_change' ? 'bg-white border border-orange-200 text-slate-700' :
                    'bg-blue-50 text-blue-900'
                  }`}>
                    {item.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-slate-200 bg-white safe-area-pb">
          <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center">
            <input
              type="text"
              className="flex-1 p-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="Escribir nota..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button 
              type="submit"
              disabled={!comment.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
