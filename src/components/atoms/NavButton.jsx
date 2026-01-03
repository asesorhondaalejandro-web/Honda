import React from 'react';

const NavButton = ({ active, onClick, icon, label, primary }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active
        ? 'bg-blue-600 text-white shadow-md'
        : primary
          ? 'bg-white/10 text-white hover:bg-white/20'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export default NavButton;
