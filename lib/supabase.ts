// Só para uso no servidor: a chave secreta dá acesso total ao banco.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const BUCKET = "briefing-arquivos";

let client: SupabaseClient | null = null;

/** Aceita a URL colada de vários jeitos (sem https, com /rest/v1, link do dashboard...). */
function normalizeUrl(raw: string) {
  let url = raw.trim().replace(/^["']|["']$/g, "");
  const dashboard = url.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboard) return `https://${dashboard[1]}.supabase.co`;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url.replace(/\/+$/, "").replace(/\/(rest|auth|storage)\/v1.*$/i, "");
}

const normalizeKey = (raw: string) => raw.trim().replace(/^["']|["']$/g, "");

function config() {
  const url = process.env.SUPABASE_URL ? normalizeUrl(process.env.SUPABASE_URL) : "";
  const key = process.env.SUPABASE_SECRET_KEY ? normalizeKey(process.env.SUPABASE_SECRET_KEY) : "";
  return { url, key };
}

/** Cliente do Supabase com a chave secreta, ou null se as variáveis não estiverem configuradas. */
export function getSupabase(): SupabaseClient | null {
  const { url, key } = config();
  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

/** A chave colada é a pública (anon/publishable), que não tem acesso às tabelas? */
function isPublicKey(key: string) {
  if (key.startsWith("sb_publishable_")) return true;
  const payload = key.split(".")[1];
  if (!payload) return false;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()).role === "anon";
  } catch {
    return false;
  }
}

/** Problema nas variáveis que dá para ver sem chamar o Supabase, ou null. */
export function supabaseConfigProblem(): string | null {
  const { url, key } = config();
  if (!url && !key)
    return "As variáveis SUPABASE_URL e SUPABASE_SECRET_KEY não estão cadastradas na Vercel (ou falta fazer o Redeploy).";
  if (!url) return "A variável SUPABASE_URL não está cadastrada na Vercel (ou falta fazer o Redeploy).";
  if (!key) return "A variável SUPABASE_SECRET_KEY não está cadastrada na Vercel (ou falta fazer o Redeploy).";
  if (isPublicKey(key)) {
    return "A SUPABASE_SECRET_KEY está com a chave pública (anon/publishable). Troque pela secret key (sb_secret_...) ou pela service_role.";
  }
  return null;
}

/** Explica em português, para o painel, por que o Supabase não respondeu. */
export function explainSupabaseError(error: unknown): string {
  const problem = supabaseConfigProblem();
  if (problem) return problem;
  const { url } = config();
  const message = String((error as Error)?.message ?? error);
  if (/could not find the table|does not exist|PGRST205|42P01/i.test(message)) {
    return "As tabelas não existem: rode o arquivo supabase/schema.sql no SQL Editor do Supabase.";
  }
  if (/invalid api key|jws|jwt|unauthorized|401|403/i.test(message)) {
    return "A SUPABASE_SECRET_KEY foi recusada. Copie de novo a secret key em Project Settings → API Keys e faça o Redeploy.";
  }
  if (/fetch failed|ENOTFOUND|getaddrinfo|Invalid URL|ECONNREFUSED/i.test(message)) {
    return `Não foi possível falar com o Supabase em ${url}. Confira a SUPABASE_URL (formato: https://xxxxx.supabase.co) e se o projeto não está pausado.`;
  }
  return `O Supabase respondeu: ${message}`;
}
