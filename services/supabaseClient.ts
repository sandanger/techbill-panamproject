import { createClient } from '@supabase/supabase-js';

// NOTA: Cuando despliegues en Vercel, estas variables deben configurarse en 
// Settings -> Environment Variables.
// Por ahora, para pruebas locales, puedes pegar tus claves aquí directamente 
// (aunque no es recomendable subirlas a GitHub así).

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'TU_SUPABASE_URL_AQUI';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'TU_SUPABASE_ANON_KEY_AQUI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);