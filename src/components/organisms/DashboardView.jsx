import React, { useMemo } from 'react';
import KPICard from '../molecules/KPICard';
import { BarChart3, Car, MapPin, CheckCircle, Users, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { STATUS_FLOW } from '../constants';

const DashboardView = ({ leads, isSupervisor }) => {
  const stats = useMemo(() => {
    const total = leads.length;
    const sold = leads.filter(l => l.status === 'sold').length;
    const visits = leads.filter(l => l.status === 'visit' || l.status === 'sold' || l.status === 'negotiation').length;
    const appointments = leads.filter(l => l.status === 'appointment' || l.status === 'visit' || l.status === 'sold').length;

    const statusData = STATUS_FLOW.map(s => ({
      name: s.label,
      count: leads.filter(l => l.status === s.key).length
    }));

    const modelCounts = {};
    leads.forEach(l => {
      modelCounts[l.modelInterest] = (modelCounts[l.modelInterest] || 0) + 1;
    });
    let modelData = Object.keys(modelCounts)
      .map(key => ({ name: key, value: modelCounts[key] }))
      .sort((a,b) => b.value - a.value);

    return { total, sold, visits, appointments, statusData, modelData };
  }, [leads]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <KPICard title={isSupervisor ? "Total" : "Míos"} value={stats.total} icon={<Users className="text-blue-500 w-5 h-5 md:w-6 md:h-6" />} />
        <KPICard title="Citas" value={stats.appointments} icon={<Calendar className="text-purple-500 w-5 h-5 md:w-6 md:h-6" />} />
        <KPICard title="Visitas" value={stats.visits} icon={<MapPin className="text-orange-500 w-5 h-5 md:w-6 md:h-6" />} />
        <KPICard title="Ventas" value={stats.sold} icon={<CheckCircle className="text-green-500 w-5 h-5 md:w-6 md:h-6" />} isSuccess />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-slate-400"/>
            Embudo de Ventas
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={60}/>
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Car size={20} className="text-slate-400"/>
            Modelos de Interés
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart layout="vertical" data={stats.modelData}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
