import { createClient } from '@supabase/supabase-js';

// Con Vite, la forma estándar de acceder a variables es import.meta.env
// Gracias a la configuración en vite.config.ts, podemos leer REACT_APP_
const getEnvVar = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[key] || '';
  }
  return '';
};

const supabaseUrl = getEnvVar('REACT_APP_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('REACT_APP_SUPABASE_ANON_KEY');

// Validate URL format
const isValidUrl = (url: string | null) => {
  if (!url || url.includes('TU_SUPABASE_URL')) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const supabase = (isValidUrl(supabaseUrl) && supabaseAnonKey)
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;