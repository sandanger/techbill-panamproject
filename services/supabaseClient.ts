/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// En Vite, las variables de entorno deben empezar por VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Intentando conectar a Supabase:", supabaseUrl ? "URL OK" : "Falta URL");

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;