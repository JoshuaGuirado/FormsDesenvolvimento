// Login do painel administrativo. Só para uso no servidor.
// A senha fica apenas na variável de ambiente ADMIN_PASSWORD (nunca no código nem no navegador).
// A sessão é um cookie httpOnly assinado com HMAC: trocar a senha desconecta todo mundo.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabase } from "./supabase";

export const SESSION_COOKIE = "linka_admin";
const SESSION_DAYS = 7;
const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;

const sha256 = (value: string) => createHash("sha256").update(value).digest();

function signingKey() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("linka-admin-session").digest();
}

function sign(expires: number, key: Buffer) {
  return createHmac("sha256", key).update(String(expires)).digest("base64url");
}

export function isPasswordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(input: string) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  // Compara os hashes em tempo constante para não vazar nada pelo tempo de resposta.
  return timingSafeEqual(sha256(input), sha256(password));
}

export async function createSession() {
  const key = signingKey();
  if (!key) throw new Error("ADMIN_PASSWORD não configurada.");
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  (await cookies()).set(SESSION_COOKIE, `${expires}.${sign(expires, key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    expires: new Date(expires),
  });
}

export async function destroySession() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" });
}

export async function isAuthenticated() {
  const key = signingKey();
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!key || !value) return false;
  const [expiresRaw, signature] = value.split(".");
  const expires = Number(expiresRaw);
  if (!expires || expires < Date.now() || !signature) return false;
  const expected = Buffer.from(sign(expires, key));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/** Use no topo de toda página e ação do painel. */
export async function requireAdmin() {
  if (!(await isAuthenticated())) redirect("/admin/login");
}

async function clientIp() {
  const list = await headers();
  return (list.get("x-forwarded-for")?.split(",")[0] || list.get("x-real-ip") || "desconhecido").trim();
}

/** Bloqueia o IP depois de várias senhas erradas seguidas. */
export async function isLockedOut() {
  const supabase = getSupabase();
  if (!supabase) return false;
  const since = new Date(Date.now() - LOCK_MINUTES * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip", await clientIp())
    .gte("created_at", since);
  return (count ?? 0) >= MAX_FAILURES;
}

export async function recordFailure() {
  await getSupabase()?.from("login_attempts").insert({ ip: await clientIp() });
}

export async function clearFailures() {
  await getSupabase()?.from("login_attempts").delete().eq("ip", await clientIp());
}

export const LOCK_MESSAGE = `Muitas tentativas erradas. Tente de novo em ${LOCK_MINUTES} minutos.`;
