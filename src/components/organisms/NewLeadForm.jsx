import React, { useState } from 'react';
import { UserPlus, Target, UserCog, CheckCircle } from 'lucide-react';
import { MODELS, ADVISORS } from '../constants';

const NewLeadForm = ({ onSubmit, onCancel, isSupervisor, currentUserData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    modelInterest: MODELS[0],
    source: isSupervisor ? 'hdm' : 'prospeccion', 
    manualAdvisorId: 'auto',
    entryDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 animate-fade-in pb-20">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
          <UserPlus size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Registrar</h2>
          <p className="text-sm text-slate-500">Nuevo cliente potencial</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
          <input 
            type="text" 
            required
            value={formData.name}
            onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
            <input 
              type="tel" 
              required
              value={formData.phone}
              onChange={e => setFormData(prev => ({...prev, phone: e.target.value}))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
            <select 
              className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none bg-white"
              value={formData.modelInterest}
              onChange={e => setFormData(prev => ({...prev, modelInterest: e.target.value}))}
            >
              {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo (Opcional)</label>
            <input 
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({...prev, email: e.target.value}))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Ingreso</label>
            <input 
              type="date"
              value={formData.entryDate}
              onChange={e => setFormData(prev => ({...prev, entryDate: e.target.value}))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <Target size={16} className="text-slate-400"/> Fuente
            </label>
            <select 
              className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none bg-white"
              value={formData.source}
              onChange={e => setFormData(prev => ({...prev, source: e.target.value}))}
            >
              <option value="hdm">HDM (Honda Digital)</option>
              <option value="redes">Redes Sociales</option>
              <option value="prospeccion">Prospección</option>
              <option value="piso">Piso / Showroom</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="llamada">Llamada Entrante</option>
              <option value="gerencia">Gerencia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <UserCog size={16} className="text-slate-400"/> Asignar
            </label>
            {isSupervisor ? (
              <select 
                className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none bg-white"
                value={formData.manualAdvisorId}
                onChange={e => setFormData(prev => ({...prev, manualAdvisorId: e.target.value}))}
              >
                <option value="auto">⚡ Automático</option>
                <optgroup label="Asignación Manual">
                  {ADVISORS.map(adv => (
                    <option key={adv.id} value={adv.id}>{adv.name}</option>
                  ))}
                </optgroup>
              </select>
            ) : (
              <div className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 text-sm flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500"/>
                Mí mismo
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-lg text-slate-600 bg-slate-100 font-medium">Cancelar</button>
          <button type="submit" className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-medium shadow-md">Guardar</button>
        </div>
      </form>
    </div>
  );
};

export default NewLeadForm;
