import { getSupabase } from "@/lib/supabase";

// Chamada pelo Cron da Vercel a cada 2 dias (ver vercel.json). O plano grátis do
// Supabase pausa o projeto depois de 7 dias sem uso; esta gravação conta como uso.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ message: "Não autorizado." }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) return Response.json({ message: "Supabase não configurado." }, { status: 500 });

  const { data: current, error: readError } = await supabase.from("keepalive").select("pings").eq("id", 1).maybeSingle();
  if (readError) return Response.json({ message: readError.message }, { status: 500 });

  const pings = Number(current?.pings ?? 0) + 1;
  const pingedAt = new Date().toISOString();
  const { error } = await supabase.from("keepalive").upsert({ id: 1, pinged_at: pingedAt, pings });
  if (error) return Response.json({ message: error.message }, { status: 500 });

  // Aproveita para limpar tentativas de login com mais de 1 dia.
  await supabase
    .from("login_attempts")
    .delete()
    .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  return Response.json({ ok: true, pings, pingedAt });
}
