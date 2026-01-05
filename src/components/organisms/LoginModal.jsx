import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';

const LoginModal = ({ onLogin, advisors = [] }) => {
  const [selected, setSelected] = useState('supervisor');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(selected);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-full text-blue-600">
            <UserPlus size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Iniciar sesión</h3>
            <p className="text-sm text-slate-500">Selecciona tu usuario para ver tus leads</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Cuenta</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
          >
            <option value="supervisor">Supervisor General</option>
            <optgroup label="Asesores">
              {advisors.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </optgroup>
          </select>

          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2 rounded-lg bg-blue-600 text-white">Ingresar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
