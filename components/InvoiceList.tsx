import React, { useState } from 'react';
import { ServiceRecord } from '../types';
import { formatCurrency } from '../utils';
import { Edit2, Search, Filter, Download, Calendar, X } from 'lucide-react';

interface InvoiceListProps {
  data: ServiceRecord[];
  onEdit: (record: ServiceRecord) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ data, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Column Filters
  const [filters, setFilters] = useState({
    caseId: '',
    serviceType: '',
    department: '',
    beneficiary: '',
    status: ''
  });

  // Combined Filtering Logic
  const filteredData = data.filter(item => {
    // 1. Global Search
    const matchesSearch = 
      item.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.beneficiary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Date Range Logic
    if (startDate || endDate) {
      const [day, month, year] = item.date.split('/').map(Number);
      const itemDate = new Date(year, month - 1, day);
      itemDate.setHours(0, 0, 0, 0);

      if (startDate) {
        const [sY, sM, sD] = startDate.split('-').map(Number);
        const start = new Date(sY, sM - 1, sD);
        if (itemDate < start) return false;
      }

      if (endDate) {
        const [eY, eM, eD] = endDate.split('-').map(Number);
        const end = new Date(eY, eM - 1, eD);
        if (itemDate > end) return false;
      }
    }

    // 3. Column Filters
    if (showFilters) {
        if (filters.caseId && !item.caseId.toLowerCase().includes(filters.caseId.toLowerCase())) return false;
        if (filters.serviceType && !item.serviceType.toLowerCase().includes(filters.serviceType.toLowerCase())) return false;
        if (filters.department && !item.department.toLowerCase().includes(filters.department.toLowerCase()) && !item.municipality.toLowerCase().includes(filters.department.toLowerCase())) return false;
        if (filters.beneficiary && !item.beneficiary.toLowerCase().includes(filters.beneficiary.toLowerCase())) return false;
        if (filters.status && item.status !== filters.status) return false;
    }

    return true;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Cerrado': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pendiente': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Abierto': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearDateFilters = () => {
      setStartDate('');
      setEndDate('');
  };

  const exportToCSV = () => {
    // 1. Define ALL Headers map (Label -> Key)
    const columns = [
      { label: 'ID Sistema', key: 'id' },
      { label: 'Caso', key: 'caseId' },
      { label: 'Descripción Orden', key: 'orderDescription' },
      { label: 'Servicio', key: 'serviceType' },
      { label: 'Departamento', key: 'department' },
      { label: 'Municipio', key: 'municipality' },
      { label: 'Dificultad (DDA)', key: 'difficulty' },
      { label: 'Beneficiario', key: 'beneficiary' },
      { label: 'Fecha', key: 'date' },
      { label: 'Acta', key: 'acta' },
      // Financials
      { label: 'Valor Labor', key: 'valueLabor' },
      { label: 'Día Adicional', key: 'valueAdditionalDay' },
      { label: 'Visita Fallida', key: 'valueFailedVisit' },
      { label: 'Obras Civiles', key: 'valueCivilWorks' },
      { label: 'Transportes', key: 'valueTransport' },
      { label: 'Subtotal Servicio', key: 'subtotalService' },
      { label: 'Total Servicio', key: 'totalService' },
      // Taxes
      { label: 'IVA', key: 'iva' },
      { label: 'Retención Fuente', key: 'reteFuente' },
      { label: 'Rete ICA', key: 'reteIca' },
      { label: 'Otros Descuentos', key: 'otherDiscounts' },
      // Balance
      { label: 'Saldo Labor', key: 'balanceLabor' },
      { label: 'Anticipo', key: 'advanceAmount' },
      { label: 'Neto a Pagar', key: 'balanceToPay' },
      // Status
      { label: 'Estado', key: 'status' },
      { label: 'Observaciones', key: 'observation' },
    ];

    // 2. Generate CSV Rows
    const headers = columns.map(c => c.label).join(',');
    
    const rows = filteredData.map(record => {
      return columns.map(col => {
        const val = record[col.key as keyof ServiceRecord];
        
        // Handle numbers (preserve them for excel formulas) and strings (quote them)
        if (typeof val === 'number') {
            return val.toString();
        }
        // Handle null/undefined
        if (val === null || val === undefined) {
            return '""';
        }
        // Escape quotes in strings
        return `"${val.toString().replace(/"/g, '""')}"`;
      }).join(',');
    });

    // 3. Construct File
    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_detallado_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
      <div className="p-5 border-b border-slate-200 flex flex-col gap-4">
        
        {/* Top Row: Title + Search + Main Actions */}
        <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800">Ordenes de Servicio</h2>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto items-center">
            <div className="relative flex-1 w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                type="text"
                placeholder="Buscar caso, técnico..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                >
                    <Filter size={18} />
                    Filtros
                </button>

                <button 
                    onClick={exportToCSV}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                    title="Exportar filas visibles con TODAS las columnas"
                >
                    <Download size={18} />
                    Exportar
                </button>
            </div>
            </div>
        </div>
        
        {/* Second Row: Date Filters (Conditional or Always visible if needed, kept visible for easy access as requested) */}
        {showFilters && (
            <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                    <Calendar size={16} />
                    Rango de Fecha:
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-500 uppercase">Desde</span>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-2 py-1 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-500 uppercase">Hasta</span>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-2 py-1 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                </div>
                
                {(startDate || endDate) && (
                    <button onClick={clearDateFilters} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X size={18} />
                    </button>
                )}
            </div>
        )}
      </div>

      <div className="overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Caso / Fecha</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Servicio</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ubicación</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Beneficiario</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Anticipo</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo Final</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
            </tr>
            {/* Column Filter Row */}
            {showFilters && (
                <tr className="bg-blue-50 border-b border-blue-100">
                    <td className="px-6 py-2">
                        <input 
                            type="text" 
                            placeholder="Filtrar Caso..." 
                            className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-400 outline-none"
                            value={filters.caseId}
                            onChange={(e) => handleFilterChange('caseId', e.target.value)}
                        />
                    </td>
                    <td className="px-6 py-2">
                        <input 
                            type="text" 
                            placeholder="Filtrar Servicio..." 
                            className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-400 outline-none"
                            value={filters.serviceType}
                            onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                        />
                    </td>
                    <td className="px-6 py-2">
                        <input 
                            type="text" 
                            placeholder="Filtrar Ubicación..." 
                            className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-400 outline-none"
                            value={filters.department}
                            onChange={(e) => handleFilterChange('department', e.target.value)}
                        />
                    </td>
                    <td className="px-6 py-2">
                        <input 
                            type="text" 
                            placeholder="Filtrar Técnico..." 
                            className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-400 outline-none"
                            value={filters.beneficiary}
                            onChange={(e) => handleFilterChange('beneficiary', e.target.value)}
                        />
                    </td>
                    <td className="px-6 py-2"></td>
                    <td className="px-6 py-2"></td>
                    <td className="px-6 py-2">
                        <select 
                             className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-400 outline-none bg-white"
                             value={filters.status}
                             onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="Abierto">Abierto</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Cerrado">Cerrado</option>
                        </select>
                    </td>
                </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((record) => (
              <tr 
                key={record.id} 
                onClick={() => onEdit(record)}
                className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{record.caseId}</div>
                  <div className="text-xs text-slate-500">{record.date}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${record.serviceType === 'INSTALACION' ? 'bg-green-100 text-green-800' : 
                      record.serviceType === 'MANTENIMIENTO' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                    {record.serviceType}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-900">{record.municipality}</div>
                  <div className="text-xs text-slate-500">{record.department}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                  {record.beneficiary}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {formatCurrency(record.advanceAmount)}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800">
                  {formatCurrency(record.balanceToPay)}
                </td>
                <td className="px-6 py-4">
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceList;