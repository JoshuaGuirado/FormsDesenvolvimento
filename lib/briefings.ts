// Leitura e gravação dos briefings no Supabase. Só para uso no servidor.
import type { Answers } from "./questions";
import { BUCKET, getSupabase } from "./supabase";

export type StoredFile = { name: string; path: string; size: number };

export type Briefing = {
  id: string;
  created_at: string;
  empresa: string;
  nome: string;
  email: string;
  whatsapp: string | null;
  answers: Answers;
  arquivos: StoredFile[];
};

const safeName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w.-]+/g, "-")
    .slice(-120);

/** Salva o briefing e os arquivos. Retorna o id, ou lança erro se o banco falhar. */
export async function saveBriefing(answers: Answers, files: File[]): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado.");

  const id = crypto.randomUUID();
  const arquivos: StoredFile[] = [];
  for (const [index, file] of files.entries()) {
    const path = `${id}/${index + 1}-${safeName(file.name)}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type || "application/octet-stream" });
    // Um arquivo que não subiu não impede salvar as respostas (ele também vai anexado no e-mail).
    if (error) console.error(`Erro ao salvar o arquivo "${file.name}":`, error.message);
    else arquivos.push({ name: file.name, path, size: file.size });
  }

  const { error } = await supabase.from("briefings").insert({
    id,
    empresa: String(answers.empresa ?? ""),
    nome: String(answers.nome ?? ""),
    email: String(answers.email ?? "").trim(),
    whatsapp: String(answers.whatsapp ?? "") || null,
    answers,
    arquivos,
  });
  if (error) throw new Error(error.message);
  return id;
}

function requireSupabase() {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado: defina SUPABASE_URL e SUPABASE_SECRET_KEY.");
  return supabase;
}

export async function listBriefings(): Promise<Briefing[]> {
  const { data, error } = await requireSupabase()
    .from("briefings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error(error.message);
  return data as Briefing[];
}

export async function getBriefing(id: string): Promise<Briefing | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await requireSupabase().from("briefings").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Briefing | null;
}

/** Links temporários (1 hora) para baixar os arquivos do bucket privado. */
export async function fileLinks(files: StoredFile[]) {
  if (files.length === 0) return [];
  const { data, error } = await requireSupabase()
    .storage.from(BUCKET)
    .createSignedUrls(
      files.map((file) => file.path),
      60 * 60,
    );
  if (error) throw new Error(error.message);
  return files.map((file, i) => ({ ...file, url: data[i]?.signedUrl ?? null }));
}

export async function deleteBriefing(id: string) {
  const supabase = requireSupabase();
  const briefing = await getBriefing(id);
  if (!briefing) return;
  if (briefing.arquivos.length) {
    await supabase.storage.from(BUCKET).remove(briefing.arquivos.map((file) => file.path));
  }
  const { error } = await supabase.from("briefings").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
