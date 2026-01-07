export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const parseCurrencyString = (str: string): number => {
  if (!str || typeof str !== 'string') return 0;
  const cleanStr = str.replace(/[$. ]/g, '');
  const num = parseInt(cleanStr, 10);
  return isNaN(num) ? 0 : num;
};

export const formatDate = (dateStr: string) => {
  return dateStr; 
};

// Converts DD/MM/YYYY to YYYY-MM-DD for input[type="date"]
export const toInputDate = (dateStr: string): string => {
  if (!dateStr) return '';
  // Check if already YYYY-MM-DD
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
  
  const parts = dateStr.split('/');
  if (parts.length !== 3) return '';
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

// Converts YYYY-MM-DD to DD/MM/YYYY for display/storage
export const fromInputDate = (isoDate: string): string => {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};