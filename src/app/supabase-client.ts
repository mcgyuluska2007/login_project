import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

export const supabase: SupabaseClient | null = environment.supabaseUrl && environment.supabaseAnonKey
  ? createClient(environment.supabaseUrl, environment.supabaseAnonKey)
  : null;
