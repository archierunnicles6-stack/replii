import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Electron can't use localStorage the same way — use in-memory + manual persist
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: "pkce",
  },
});

export type SupabaseUser = {
  id: string;
  email: string;
  name: string;
  avatar: string;
};

export function toAppUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, string>;
}): SupabaseUser {
  const email = user.email ?? "";
  const name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    email.split("@")[0] ??
    "User";
  const avatar =
    user.user_metadata?.avatar_url ??
    user.user_metadata?.picture ??
    name[0]?.toUpperCase() ??
    "G";
  return { id: user.id, email, name, avatar };
}

export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl && supabaseAnonKey);
