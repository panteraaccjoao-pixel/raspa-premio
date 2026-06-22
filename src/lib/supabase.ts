import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cliente público (anon) — pode ser usado no browser.
// Null se as variáveis não estiverem configuradas.
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

// Cliente admin (service_role) — SOMENTE no servidor. Nunca importe em
// componentes client. Ignora RLS, por isso a chave precisa ficar secreta.
export function supabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
