// Só para uso no servidor: a chave secreta dá acesso total ao banco.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const BUCKET = "briefing-arquivos";

let client: SupabaseClient | null = null;

/** Cliente do Supabase com a chave secreta, ou null se as variáveis não estiverem configuradas. */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
