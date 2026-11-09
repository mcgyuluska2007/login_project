import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface RuntimeEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

const runtimeEnv = (import.meta as ImportMeta & { env?: RuntimeEnv }).env;
const supabaseUrl = runtimeEnv?.VITE_SUPABASE_URL;
const supabaseAnonKey = runtimeEnv?.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
