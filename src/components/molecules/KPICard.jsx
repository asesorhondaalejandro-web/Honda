import React from 'react';

const KPICard = ({ title, value, icon, isSuccess }) => (
  <div className={`bg-white p-4 rounded-xl border ${isSuccess ? 'border-green-200 bg-green-50' : 'border-slate-200'} shadow-sm flex flex-col justify-between h-24 md:h-auto`}>
    <div className="flex justify-between items-start">
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <div className={`p-1.5 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-slate-100'}`}>
        {icon}
      </div>
    </div>
    <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
  </div>
);

export default KPICard;
