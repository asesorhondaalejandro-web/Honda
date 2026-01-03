import React, { useState } from 'react';
import { Search, Car, Star, Archive } from 'lucide-react';
import { STATUS_FLOW, SOURCES } from '../constants';

const LeadsListView = ({ leads, onSelect, onToggleFavorite, onToggleArchive, isSupervisor }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full animate-fade-in overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-col gap-3 bg-slate-50/50">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none bg-white"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Todos los estatus</option>
          {STATUS_FLOW.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      <div className="overflow-y-auto flex-1 pb-10">
        {filteredLeads.length === 0 ? (
          <div className="p-10 text-center text-slate-400">No hay resultados.</div>
        ) : (
          filteredLeads.map(lead => {
             const sourceConfig = SOURCES.find(s => s.id === lead.source) || SOURCES[0];
             const statusConfig = STATUS_FLOW.find(s => s.key === lead.status) || STATUS_FLOW[0];
             
             return (
              <div 
                key={lead.id} 
                className="p-4 border-b border-slate-100 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1" onClick={() => onSelect(lead)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${sourceConfig.color}`}>
                        {sourceConfig.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {lead.entryDate instanceof Date 
                          ? lead.entryDate.toLocaleDateString(undefined, {month:'short', day:'numeric'})
                          : 'Hoy'}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800 text-base">{lead.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite(lead.id); }}
                      className="p-1"
                    >
                      <Star size={18} className={lead.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-slate-300"} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleArchive(lead.id); }}
                      className="p-1"
                    >
                      <Archive size={18} className="text-slate-400 hover:text-slate-600" />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-end" onClick={() => onSelect(lead)}>
                  <div className="flex flex-col gap-1">
                     <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Car size={12}/> {lead.modelInterest}
                     </span>
                     {isSupervisor && (
                       <span className="text-xs text-slate-400">
                         Asesor: {lead.advisorName?.split(' ')[0]}
                       </span>
                     )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LeadsListView;
