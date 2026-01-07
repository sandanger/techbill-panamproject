import { createClient } from '@supabase/supabase-js';

// En Vite, las variables de entorno deben empezar por VITE_
// Fix: Cast import.meta to any to avoid "Property 'env' does not exist on type 'ImportMeta'" and remove missing vite/client reference
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

console.log("Intentando conectar a Supabase:", supabaseUrl ? "URL OK" : "Falta URL");

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;