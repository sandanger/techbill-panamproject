import React, { useState, useEffect } from 'react';
import { ServiceRecord } from '../types';
import { formatCurrency, toInputDate, fromInputDate } from '../utils';
import { X, Save, Calculator, FileText, DollarSign, Briefcase, Percent, CheckCircle, ChevronDown, MessageSquare, Trash2, AlertTriangle } from 'lucide-react';

interface BillingModalProps {
  record: ServiceRecord | null;
  onClose: () => void;
  onSave: (updatedRecord: ServiceRecord) => void;
  onDelete: (id: string) => void;
  isNew?: boolean;
}

const BillingModal: React.FC<BillingModalProps> = ({ record, onClose, onSave, onDelete, isNew }) => {
  const [formData, setFormData] = useState<ServiceRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const OTHER_SERVICE_OPTIONS = [
    "Alquier de semoviente",
    "Acompañamiento de seguridad",
    "Expreso 4x4",
    "Expreso fluvial",
    "Expreso moto",
    "Alquiler de planta",
    "Transporte de planta",
    "Tala de árboles",
    "Materiales Obra Civil",
    "Mano de Obra Civil"
  ];

  useEffect(() => {
    if (record) {
      setFormData({ ...record });
      setShowDeleteConfirm(false); // Reset delete confirmation state when opening new record
    }
  }, [record]);

  if (!record || !formData) return null;

  // --- BUSINESS LOGIC: CALCULATION ENGINE ---
  const calculateTotals = () => {
    // MODULO 3 LOGIC
    const additionalServicesTotal = (formData.additionalServices || []).reduce((acc, curr) => acc + (curr.value || 0), 0);

    const incomeNoTransport = 
      (formData.valueLabor || 0) +
      (formData.valueAdditionalDay || 0) +
      (formData.valueFailedVisit || 0) +
      (formData.valueCivilWorks || 0) +
      additionalServicesTotal;

    const transport = formData.valueTransport || 0;
    
    const totalService = incomeNoTransport + transport;

    // MODULO 4 LOGIC
    const taxes = 
      (formData.reteFuente || 0) +
      (formData.reteIca || 0) +
      (formData.otherDiscounts || 0);
    
    const iva = formData.iva || 0;

    // MODULO 5 LOGIC
    // Saldo Labor técnico : Total Servicio + IVA 19% - Resto de impuestos
    const balanceLabor = totalService + iva - taxes;

    // Final Payout (Implied logic: Balance - Advances)
    const balanceToPay = balanceLabor - (formData.advanceAmount || 0);

    setFormData(prev => {
        if(!prev) return null;
        return {
            ...prev,
            subtotalService: incomeNoTransport, // "Subtotal Servicio sin excedente transportes"
            totalService: totalService,
            balanceLabor: balanceLabor,
            balanceToPay: balanceToPay
        }
    });
  };

  const handleChange = (field: keyof ServiceRecord, value: any) => {
    setFormData(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  // Helper to safely parse numbers
  const handleNumChange = (field: keyof ServiceRecord, value: string) => {
    const num = value === '' ? 0 : parseFloat(value);
    handleChange(field, num);
  };

  // Helper to handle Date
  const handleDateChange = (value: string) => {
    handleChange('date', fromInputDate(value));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="text-blue-600" size={24} />
              {isNew ? 'Crear Nuevo Servicio' : 'Editar Servicio'}
            </h2>
            <p className="text-sm text-slate-500">Diligencie los 5 módulos para liquidar el servicio.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content: 5 MODULES */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-100/50 space-y-6">
          
          {/* MODULO 1: DESCRIPCIÓN */}
          <section className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-blue-800 uppercase mb-4 flex items-center gap-2 border-b border-blue-100 pb-2">
              <FileText size={18} /> Módulo 1: Descripción del Servicio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InputField label="Tipo de Servicio" value={formData.serviceType} onChange={(v) => handleChange('serviceType', v)} />
              <InputField label="Departamento" value={formData.department} onChange={(v) => handleChange('department', v)} />
              <InputField label="Municipio" value={formData.municipality} onChange={(v) => handleChange('municipality', v)} />
              <InputField label="DDA (Dificultad)" value={formData.difficulty} onChange={(v) => handleChange('difficulty', v)} />

              <InputField label="Cliente" value={formData.cliente} onChange={(v) => handleChange('cliente', v)} />
              <InputField label="Tipo de Antena" value={formData.tipoAntena} onChange={(v) => handleChange('tipoAntena', v)} />
              <InputField label="Beneficiario" value={formData.beneficiary} onChange={(v) => handleChange('beneficiary', v)} />
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Fecha</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={toInputDate(formData.date)}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </div>

              <InputField label="Caso" value={formData.caseId} onChange={(v) => handleChange('caseId', v)} />
              <InputField label="Orden" value={formData.orderDescription} onChange={(v) => handleChange('orderDescription', v)} />
              <InputField label="Acta" value={formData.acta} onChange={(v) => handleChange('acta', v)} />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* MODULO 2: ANTICIPO */}
            <section className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm h-fit">
              <h3 className="text-sm font-bold text-amber-600 uppercase mb-4 flex items-center gap-2 border-b border-amber-100 pb-2">
                <DollarSign size={18} /> Módulo 2: Valor Anticipado
              </h3>
              <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
                <MoneyInput 
                  label="Valor Anticipo" 
                  value={formData.advanceAmount} 
                  onChange={(v) => handleNumChange('advanceAmount', v)} 
                  highlight
                />
              </div>
            </section>

             {/* MODULO 4: IMPUESTOS */}
             <section className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm h-fit">
              <h3 className="text-sm font-bold text-red-600 uppercase mb-4 flex items-center gap-2 border-b border-red-100 pb-2">
                <Percent size={18} /> Módulo 4: Impuestos y Retenciones
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <MoneyInput label="IVA 19%" value={formData.iva} onChange={(v) => handleNumChange('iva', v)} />
                 <MoneyInput label="Retención en la Fuente" value={formData.reteFuente} onChange={(v) => handleNumChange('reteFuente', v)} />
                 <MoneyInput label="Rete ICA" value={formData.reteIca} onChange={(v) => handleNumChange('reteIca', v)} />
                 <MoneyInput label="Desc. Parafiscales / Transp." value={formData.otherDiscounts} onChange={(v) => handleNumChange('otherDiscounts', v)} />
              </div>
            </section>
          </div>

          {/* MODULO 3: FACTURACIÓN */}
          <section className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-emerald-600 uppercase mb-4 flex items-center gap-2 border-b border-emerald-100 pb-2">
              <Calculator size={18} /> Módulo 3: Facturación Servicio
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 mb-6">
               <MoneyInput label="Valor Labor (Inst/Mant/Mig/Desins)" value={formData.valueLabor} onChange={(v) => handleNumChange('valueLabor', v)} />
               <MoneyInput label="Día Adicional" value={formData.valueAdditionalDay} onChange={(v) => handleNumChange('valueAdditionalDay', v)} />
               <MoneyInput label="Visita Fallida" value={formData.valueFailedVisit} onChange={(v) => handleNumChange('valueFailedVisit', v)} />
               <MoneyInput label="Obras Civiles - Otros" value={formData.valueCivilWorks} onChange={(v) => handleNumChange('valueCivilWorks', v)} />
               <MoneyInput label="Transportes Excedentes Leg." value={formData.valueTransport} onChange={(v) => handleNumChange('valueTransport', v)} />
            </div>

            {/* Additional Services (Otros) */}
            <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-2">
                  <Plus size={14} /> Servicios Adicionales (Otros)
                </h4>
                <button 
                  onClick={() => {
                    const current = formData.additionalServices || [];
                    handleChange('additionalServices', [...current, { name: OTHER_SERVICE_OPTIONS[0], value: 0 }]);
                  }}
                  className="text-[10px] bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700 transition-colors uppercase font-bold"
                >
                  Agregar Otro
                </button>
              </div>

              {(!formData.additionalServices || formData.additionalServices.length === 0) ? (
                <div className="text-center py-4 text-xs text-slate-400 italic bg-white/50 rounded border border-dashed border-emerald-200">
                  No hay servicios adicionales agregados
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.additionalServices.map((service, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end animate-in fade-in slide-in-from-top-1">
                      <div className="sm:col-span-7 flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-emerald-600 uppercase">Concepto</label>
                        <select 
                          className="w-full px-3 py-1.5 border border-emerald-200 rounded text-sm bg-white"
                          value={service.name}
                          onChange={(e) => {
                            const updated = [...formData.additionalServices];
                            updated[index].name = e.target.value;
                            handleChange('additionalServices', updated);
                          }}
                        >
                          {OTHER_SERVICE_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-4">
                        <MoneyInput 
                          label="Valor" 
                          value={service.value} 
                          onChange={(v) => {
                            const updated = [...formData.additionalServices];
                            updated[index].value = v === '' ? 0 : parseFloat(v);
                            handleChange('additionalServices', updated);
                          }} 
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-center pb-1">
                        <button 
                          onClick={() => {
                            const updated = formData.additionalServices.filter((_, i) => i !== index);
                            handleChange('additionalServices', updated);
                          }}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Calculated Fields for M3 */}
               <div className="p-3 bg-slate-50 rounded border border-slate-200 flex justify-between items-center md:col-span-2 lg:col-span-1">
                 <span className="text-xs font-semibold text-slate-600">Subtotal (Servicios s/ Transp.)</span>
                 <span className="font-mono font-bold text-slate-800">{formatCurrency(formData.subtotalService)}</span>
               </div>
               
               <div className="lg:col-span-2 flex justify-end items-center gap-4">
                  <span className="text-sm font-bold text-emerald-800 uppercase">Total Servicio (Módulo 3):</span>
                  <span className="text-xl font-bold text-emerald-600 bg-emerald-50 px-4 py-1 rounded">{formatCurrency(formData.totalService)}</span>
               </div>
            </div>
          </section>

          {/* MODULO 5: ESTADO FINAL */}
          <section className="bg-slate-800 p-6 rounded-lg shadow-md text-white">
            <h3 className="text-sm font-bold text-blue-300 uppercase mb-4 flex items-center gap-2 border-b border-slate-600 pb-2">
              <CheckCircle size={18} /> Módulo 5: Estado Final y Saldos (COP)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
              
               {/* Status Selector */}
               <div className="md:col-span-1">
                 <label className="text-xs font-medium text-slate-400 uppercase mb-2 block">Estado de la Orden</label>
                 <div className="relative mb-4">
                   <select 
                     value={formData.status}
                     onChange={(e) => handleChange('status', e.target.value)}
                     className="w-full appearance-none bg-slate-700 text-white border border-slate-600 rounded-lg pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer hover:bg-slate-600 transition-colors"
                   >
                     <option value="Abierto">Abierto</option>
                     <option value="Pendiente">Pendiente</option>
                     <option value="Cerrado">Cerrado</option>
                   </select>
                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                 </div>
               </div>

              {/* Totals Display */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-400 uppercase mb-1">Saldo Labor Técnico</div>
                    <div className="text-3xl font-bold text-white tracking-tight">{formatCurrency(formData.balanceLabor)}</div>
                  </div>

                  <div className="text-right border-l border-slate-600 pl-8">
                    <div className="text-xs font-medium text-slate-400 uppercase mb-1">Neto a Pagar (- Anticipo)</div>
                    <div className={`text-2xl font-bold ${formData.balanceToPay < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {formatCurrency(formData.balanceToPay)}
                    </div>
                  </div>
              </div>
              
              {/* Observation Field */}
              <div className="md:col-span-4 mt-4 border-t border-slate-700 pt-4">
                <label className="text-xs font-medium text-slate-400 uppercase mb-2 flex items-center gap-2">
                    <MessageSquare size={14} /> Observaciones / Notas del Servicio
                </label>
                <textarea 
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    rows={3}
                    placeholder="Escriba aquí cualquier novedad, detalle de pago o incidencia relacionada con este servicio..."
                    value={formData.observation || ''}
                    onChange={(e) => handleChange('observation', e.target.value)}
                ></textarea>
              </div>

            </div>
            
             <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between items-center">
                <div className="text-xs text-slate-400 italic">
                    * Los valores se expresan en Pesos Colombianos (COP)
                </div>
                <button 
                  onClick={calculateTotals}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/50"
                >
                  <Calculator size={18} />
                  Calcular Saldos
                </button>
             </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
            
            {/* Delete Logic (Left Side) */}
            <div>
              {!isNew && (
                showDeleteConfirm ? (
                  <div className="flex items-center gap-3 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 animate-in fade-in slide-in-from-left-4">
                    <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                      <AlertTriangle size={14} /> ¿Estás seguro?
                    </span>
                    <button 
                      onClick={() => onDelete(formData.id)}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors"
                    >
                      Sí, Eliminar
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all text-sm font-medium"
                    title="Eliminar este servicio"
                  >
                    <Trash2 size={18} />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                )
              )}
            </div>

            {/* Save/Cancel Logic (Right Side) */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button 
                  onClick={() => onSave(formData)}
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-transform active:scale-95"
              >
                <Save size={18} />
                {isNew ? 'Crear Servicio' : 'Guardar Cambios'}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Components ---

const InputField = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-500 uppercase truncate" title={label}>{label}</label>
    <input 
      type="text" 
      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const MoneyInput = ({ label, value, onChange, highlight }: { label: string, value: number, onChange: (val: string) => void, highlight?: boolean }) => (
  <div className="flex flex-col gap-1">
    <label className={`text-xs font-semibold uppercase truncate ${highlight ? 'text-amber-800' : 'text-slate-500'}`} title={label}>{label}</label>
    <div className="relative w-full">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
        <input 
            type="number" 
            className={`w-full pl-6 pr-3 py-2 border rounded-md text-right text-sm outline-none focus:ring-2 transition-colors ${highlight ? 'border-amber-300 bg-white focus:ring-amber-500' : 'border-slate-300 focus:ring-blue-500'}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0"
            onFocus={(e) => e.target.select()}
        />
    </div>
  </div>
);

export default BillingModal;