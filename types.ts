export interface ServiceRecord {
  id: string; // "No"
  // Module 1: Description
  caseId: string; // "Caso"
  orderDescription: string; // "Orden"
  serviceType: string; // "Servicio"
  department: string; // "Departamento"
  municipality: string; // "Municipio"
  difficulty: string; // "DDA"
  beneficiary: string; // "Nombre Beneficiario"
  date: string; // "Fecha"
  acta: string; // "Acta" (New)
  
  // Module 2: Advances
  advanceAmount: number; // "Valor Anticipo"
  
  // Module 3: Service Billing
  valueLabor: number; // "Valor Labor..."
  valueAdditionalDay: number; // "Dia adicional"
  valueFailedVisit: number; // "Visita Fallida"
  valueCivilWorks: number; // "Obras civiles"
  valueTransport: number; // "Transportes Excedentes"
  
  // Module 4: Taxes
  iva: number; // "Iva 19%"
  reteFuente: number; // "Retención en la Fuente"
  reteIca: number; // "Rete ICA"
  otherDiscounts: number; // "Descuentos Parafiscales"
  
  // Module 5 & Calculated
  subtotalService: number; // "Subtotal Servicio sin excedente transportes"
  totalService: number; // "TOTAL SERVICIO"
  balanceLabor: number; // "Saldo Labor técnico"
  
  // Internal / Helper
  totalAdvances: number; // Kept for backward compatibility if needed, but UI uses advanceAmount
  balanceToPay: number; // Net payable after advance
  status: 'Abierto' | 'Pendiente' | 'Cerrado';
  observation: string; // New field for notes
}

export type ViewMode = 'dashboard' | 'invoices';