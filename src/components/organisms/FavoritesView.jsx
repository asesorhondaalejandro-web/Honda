import React from 'react';
import { Star, MessageSquare, Car, Phone } from 'lucide-react';
import { SOURCES, STATUS_FLOW } from '../constants';

const FavoritesView = ({ leads, onSelect, onToggleFavorite }) => {
  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
        <div className="flex items-center gap-3">
          <Star size={24} className="text-yellow-500 fill-yellow-500" />
          <div>
            <h3 className="font-semibold text-slate-800">Leads Favoritos</h3>
            <p className="text-sm text-slate-600">Seguimiento prioritario • {leads.length} leads</p>
          </div>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center border border-slate-200">
          <Star size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No tienes leads marcados como favoritos</p>
          <p className="text-sm text-slate-400 mt-1">Marca leads importantes con ⭐ para acceso rápido</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {leads.map(lead => {
            const sourceConfig = SOURCES.find(s => s.id === lead.source) || SOURCES[0];
            const statusConfig = STATUS_FLOW.find(s => s.key === lead.status) || STATUS_FLOW[0];
            const lastComment = lead.history?.filter(h => h.type === 'comment').slice(-1)[0];
            
            return (
              <div key={lead.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1" onClick={() => onSelect(lead)}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${sourceConfig.color}`}>
                        {sourceConfig.label}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg text-slate-800 mb-1">{lead.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Car size={14}/>{lead.modelInterest}</span>
                      <span className="flex items-center gap-1"><Phone size={14}/>{lead.phone}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(lead.id); }}
                    className="p-2"
                  >
                    <Star size={20} className="fill-yellow-400 text-yellow-400" />
                  </button>
                </div>

                {lastComment && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-2">
                      <MessageSquare size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-800 font-medium mb-1">Último comentario:</p>
                        <p className="text-sm text-slate-700 line-clamp-2">{lastComment.text}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {lastComment.user} • {new Date(lastComment.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesView;
