import React, { useRef, useState, useMemo } from 'react';
import { Archive, Download, Upload, X, Car } from 'lucide-react';
import { ADVISORS, SOURCES, STATUS_FLOW } from '../constants';

const ArchiveView = ({ leads, onSelect, onToggleArchive, onImportCSV }) => {
  const fileInputRef = useRef(null);
  const [groupBy, setGroupBy] = useState('month');
  const [showCSVHelp, setShowCSVHelp] = useState(false);

  const groupedLeads = useMemo(() => {
    const groups = {};
    
    leads.forEach(lead => {
      let key;
      const date = lead.entryDate instanceof Date ? lead.entryDate : new Date(lead.entryDate);
      
      if (groupBy === 'month') {
        key = date.toLocaleDateString('es', { year: 'numeric', month: 'long' });
      } else {
        key = lead.status === 'lost' ? 'Perdidos' : 'Cerrados';
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(lead);
    });
    
    return groups;
  }, [leads, groupBy]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      onImportCSV(file);
      e.target.value = '';
    } else {
      alert('Por favor selecciona un archivo CSV válido');
    }
  };

  const downloadTemplate = () => {
    const template = `nombre,telefono,email,modelo,fuente,fecha,asesor,estatus
Juan Pérez,4421234567,juan@email.com,Civic,hdm,2024-01-15,Alejandro Hurtado,new
María López,4427654321,maria@email.com,CR-V,redes,2024-01-20,Triana Montes,contacted
Carlos Ruiz,4423456789,carlos@email.com,HR-V,prospeccion,2024-02-01,Jonathan Rodriguez,lost`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_leads.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Archive size={24} className="text-slate-500" />
            <div>
              <h3 className="font-semibold text-slate-800">Archivo de Leads</h3>
              <p className="text-sm text-slate-600">{leads.length} leads archivados</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => setShowCSVHelp(!showCSVHelp)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium"
              title="Ver formato CSV"
            >
              <Download size={16} />
              Plantilla
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <Upload size={16} />
              Importar CSV
            </button>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option value="month">Por Mes</option>
              <option value="status">Por Estado</option>
            </select>
          </div>
        </div>
      </div>

      {showCSVHelp && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-fade-in">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold text-blue-900 flex items-center gap-2">
              <Download size={18} />
              Formato del CSV
            </h4>
            <button onClick={() => setShowCSVHelp(false)} className="text-blue-600">
              <X size={18} />
            </button>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-blue-800 mb-1">Columnas requeridas:</p>
              <code className="block bg-white p-2 rounded text-xs overflow-x-auto border border-blue-200">
                nombre,telefono,email,modelo,fuente,fecha,asesor,estatus
              </code>
            </div>

            <div>
              <p className="font-medium text-blue-800 mb-1">Valores de asesor (opcionales):</p>
              <ul className="text-xs text-blue-700 space-y-1 ml-4">
                {ADVISORS.map(adv => (
                  <li key={adv.id}>• {adv.name} o {adv.id}</li>
                ))}
                <li className="text-blue-500 italic">• Si no se especifica o no coincide, se asigna automáticamente</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-blue-800 mb-1">Valores de fuente:</p>
              <p className="text-xs text-blue-700">hdm, redes, prospeccion, piso, whatsapp, llamada, gerencia</p>
            </div>

            <div>
              <p className="font-medium text-blue-800 mb-1">Valores de estatus:</p>
              <p className="text-xs text-blue-700">new, contacted, appointment, visit, negotiation, sold, lost</p>
            </div>

            <button
              onClick={downloadTemplate}
              className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <Download size={16} />
              Descargar Plantilla de Ejemplo
            </button>
          </div>
        </div>
      )}

      {leads.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center border border-slate-200">
          <Archive size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No hay leads archivados</p>
          <p className="text-sm text-slate-400 mt-1">Los leads perdidos y vendidos se archivan automáticamente</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedLeads).map(([group, groupLeads]) => (
            <div key={group} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <h4 className="font-semibold text-slate-700 capitalize">{group} ({groupLeads.length})</h4>
              </div>
              <div className="divide-y divide-slate-100">
                {groupLeads.map(lead => {
                  const sourceConfig = SOURCES.find(s => s.id === lead.source) || SOURCES[0];
                  const statusConfig = STATUS_FLOW.find(s => s.key === lead.status) || STATUS_FLOW[0];
                  
                  return (
                    <div key={lead.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1" onClick={() => onSelect(lead)}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${sourceConfig.color}`}>
                              {sourceConfig.label}
                            </span>
                            <span className="text-xs text-slate-400">
                              {lead.entryDate instanceof Date 
                                ? lead.entryDate.toLocaleDateString()
                                : new Date(lead.entryDate).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-800">{lead.name}</p>
                          <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><Car size={12}/>{lead.modelInterest}</span>
                            <span className="text-xs text-slate-400">{lead.advisorName}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleArchive(lead.id); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Restaurar"
                        >
                          <Upload size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchiveView;
