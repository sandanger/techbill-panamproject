import React, { useState, useMemo } from 'react';
import { ServiceRecord } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { formatCurrency } from '../utils';
import { Users, Briefcase, FileCheck, Clock, AlertCircle, Calendar, Filter, XCircle, Banknote, Wallet } from 'lucide-react';

interface DashboardProps {
  data: ServiceRecord[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // State for Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- FILTERING LOGIC ---
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (!startDate && !endDate) return true;

      // Parse item date (DD/MM/YYYY) to Date object
      const [day, month, year] = item.date.split('/').map(Number);
      const itemDate = new Date(year, month - 1, day);
      itemDate.setHours(0, 0, 0, 0);

      let isValid = true;
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // Fix timezone issues by using start of day
        // Adding a small buffer or handling timezone offset might be needed in prod, 
        // but simple comparison works for local dates usually.
        // Actually, let's create dates using the string components to avoid UTC shifts
        const [sY, sM, sD] = startDate.split('-').map(Number);
        const startLocal = new Date(sY, sM - 1, sD);
        if (itemDate < startLocal) isValid = false;
      }

      if (endDate) {
        const [eY, eM, eD] = endDate.split('-').map(Number);
        const endLocal = new Date(eY, eM - 1, eD);
        if (itemDate > endLocal) isValid = false;
      }

      return isValid;
    });
  }, [data, startDate, endDate]);

  // --- KPI CALCULATIONS ---
  const totalCases = filteredData.length;
  const uniqueTechnicians = new Set(filteredData.map(d => d.beneficiary)).size;
  
  // Status Counts
  const openCases = filteredData.filter(d => d.status === 'Abierto').length;
  const pendingCases = filteredData.filter(d => d.status === 'Pendiente').length;
  const closedCases = filteredData.filter(d => d.status === 'Cerrado').length;

  // Financials
  const totalInvoiced = filteredData.reduce((acc, curr) => acc + curr.totalService, 0); // Gross Total
  const totalBalanceToPay = filteredData.reduce((acc, curr) => acc + curr.balanceToPay, 0); // Net to Pay

  // Chart Data: Department
  const deptMap = filteredData.reduce((acc, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const pieData = Object.keys(deptMap).map(key => ({
    name: key,
    value: deptMap[key]
  }));

  // Chart Data: Service Type
  const serviceMap = filteredData.reduce((acc, curr) => {
    acc[curr.serviceType] = (acc[curr.serviceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.keys(serviceMap).map(key => ({
    name: key,
    count: serviceMap[key]
  }));

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      
      {/* --- FILTER BAR --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-slate-600">
           <Filter size={20} className="text-blue-600" />
           <span className="font-semibold text-sm">Filtros de Período:</span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
           <div className="flex items-center gap-2 w-full sm:w-auto">
             <label className="text-xs font-medium text-slate-500 uppercase">Desde:</label>
             <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
             </div>
           </div>

           <div className="flex items-center gap-2 w-full sm:w-auto">
             <label className="text-xs font-medium text-slate-500 uppercase">Hasta:</label>
             <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
             </div>
           </div>

           {(startDate || endDate) && (
             <button 
               onClick={clearFilters}
               className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline"
             >
               Limpiar
             </button>
           )}
        </div>
      </div>

      {/* --- GENERAL KPIS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
           <div className="flex justify-between items-start z-10 relative">
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Casos</p>
                 <h3 className="text-3xl font-bold text-slate-800">{totalCases}</h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                 <Briefcase size={24} />
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
           <div className="flex justify-between items-start z-10 relative">
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Técnicos Activos</p>
                 <h3 className="text-3xl font-bold text-slate-800">{uniqueTechnicians}</h3>
              </div>
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:scale-110 transition-transform">
                 <Users size={24} />
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
           <div className="flex justify-between items-start z-10 relative">
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Facturado</p>
                 <h3 className="text-2xl font-bold text-slate-800 truncate" title={formatCurrency(totalInvoiced)}>
                    {formatCurrency(totalInvoiced)}
                 </h3>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:scale-110 transition-transform">
                 <Banknote size={24} />
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
           <div className="flex justify-between items-start z-10 relative">
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Saldo a Pagar</p>
                 <h3 className="text-2xl font-bold text-slate-800 truncate" title={formatCurrency(totalBalanceToPay)}>
                    {formatCurrency(totalBalanceToPay)}
                 </h3>
              </div>
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600 group-hover:scale-110 transition-transform">
                 <Wallet size={24} />
              </div>
           </div>
        </div>
      </div>

      {/* --- STATUS BREAKDOWN --- */}
      <h3 className="text-lg font-bold text-slate-700 mt-8 mb-2 px-2 border-l-4 border-blue-500">Estado de Ordenes</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* ABIERTO */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex items-center justify-between hover:bg-blue-50 transition-colors">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-full shadow-sm text-blue-500">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-blue-900">Abiertos</h4>
                    <p className="text-xs text-blue-600">Servicios en proceso</p>
                </div>
             </div>
             <span className="text-3xl font-bold text-blue-700">{openCases}</span>
          </div>

          {/* PENDIENTE */}
          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 flex items-center justify-between hover:bg-amber-50 transition-colors">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-full shadow-sm text-amber-500">
                    <Clock size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-amber-900">Pendientes</h4>
                    <p className="text-xs text-amber-600">Revisión o Autorización</p>
                </div>
             </div>
             <span className="text-3xl font-bold text-amber-700">{pendingCases}</span>
          </div>

          {/* CERRADO */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 flex items-center justify-between hover:bg-emerald-50 transition-colors">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-full shadow-sm text-emerald-500">
                    <FileCheck size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-emerald-900">Cerrados</h4>
                    <p className="text-xs text-emerald-600">Finalizados y Liquidados</p>
                </div>
             </div>
             <span className="text-3xl font-bold text-emerald-700">{closedCases}</span>
          </div>
      </div>

      {/* --- CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-sm"></span>
            Distribución por Departamento
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            {pieData.length > 0 ? (
                <PieChart>
                <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                >
                    {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, 'Casos']} />
                <Legend />
                </PieChart>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400 italic">
                    <div className="text-center">
                        <XCircle className="mx-auto mb-2 opacity-50" size={32} />
                        No hay datos para el período seleccionado
                    </div>
                </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
             <span className="w-2 h-6 bg-emerald-500 rounded-sm"></span>
             Casos por Tipo de Servicio
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            {barData.length > 0 ? (
                <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '12px' }} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Cantidad">
                    {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
                </BarChart>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400 italic">
                    <div className="text-center">
                        <XCircle className="mx-auto mb-2 opacity-50" size={32} />
                        No hay datos para el período seleccionado
                    </div>
                </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;