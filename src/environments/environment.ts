interface RuntimeEnvironment {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

const runtimeEnv = (import.meta as ImportMeta & { env?: {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
} }).env;

export const environment: RuntimeEnvironment = {
  supabaseUrl: runtimeEnv?.VITE_SUPABASE_URL,
  supabaseAnonKey: runtimeEnv?.VITE_SUPABASE_ANON_KEY,
};
