import { createClient } from '@supabase/supabase-js';

// En Vite, las variables de entorno deben empezar por VITE_
// Fix: Safely access env to avoid "Cannot read properties of undefined" if import.meta.env is missing
const env = (import.meta as any).env || {};

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

console.log("Intentando conectar a Supabase:", supabaseUrl ? "URL OK" : "Falta URL");

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;