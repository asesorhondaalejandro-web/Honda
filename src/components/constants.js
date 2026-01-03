export const ADVISORS = [
  { id: 'adv1', name: 'Alejandro Hurtado', color: '#3B82F6' },
  { id: 'adv2', name: 'Triana Montes', color: '#10B981' },
  { id: 'adv3', name: 'Jonathan Rodriguez', color: '#F59E0B' },
  { id: 'adv4', name: 'Lucy Figueroa', color: '#8B5CF6' },
  { id: 'adv5', name: 'Giovanni Gonzalez', color: '#EC4899' }
];

export const STATUS_FLOW = [
  { key: 'new', label: 'Nuevo', color: 'bg-blue-100 text-blue-800' },
  { key: 'contacted', label: 'Contactado', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'appointment', label: 'Cita Agendada', color: 'bg-purple-100 text-purple-800' },
  { key: 'visit', label: 'Visita Showroom', color: 'bg-orange-100 text-orange-800' },
  { key: 'negotiation', label: 'Negociación', color: 'bg-indigo-100 text-indigo-800' },
  { key: 'sold', label: 'Vendido', color: 'bg-green-100 text-green-800' },
  { key: 'lost', label: 'Perdido', color: 'bg-red-100 text-red-800' }
];

export const SOURCES = [
  { id: 'hdm', label: 'HDM (Honda Digital)', color: 'text-blue-600 bg-blue-50' },
  { id: 'redes', label: 'Redes Sociales', color: 'text-pink-600 bg-pink-50' },
  { id: 'prospeccion', label: 'Prospección', color: 'text-emerald-600 bg-emerald-50' },
  { id: 'piso', label: 'Piso / Showroom', color: 'text-purple-600 bg-purple-50' },
  { id: 'whatsapp', label: 'WhatsApp', color: 'text-green-600 bg-green-50' },
  { id: 'llamada', label: 'Llamada Entrante', color: 'text-orange-600 bg-orange-50' },
  { id: 'gerencia', label: 'Gerencia', color: 'text-slate-600 bg-slate-50' }
];

export const MODELS = ['Indefinido', 'City', 'Civic', 'Civic Hybrid', 'Accord', 'Accord Hybrid', 'B-RV', 'HR-V', 'CR-V','CR-V Hybrid', 'Pilot','Odyssey', 'Seminuevo'];

export default {
  ADVISORS,
  STATUS_FLOW,
  SOURCES,
  MODELS
};
