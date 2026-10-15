// Leitura e gravação das respostas no Supabase. Só para uso no servidor.
// Os dois formulários usam a mesma tabela; a coluna `formulario` diz de qual veio cada linha.
import { toFormId, type FormId } from "./forms";
import type { Answers } from "./questions";
import { BUCKET, getSupabase } from "./supabase";

export type StoredFile = { name: string; path: string; size: number };

export type Briefing = {
  id: string;
  created_at: string;
  formulario: FormId;
  empresa: string | null;
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

/** Linhas gravadas antes da coluna `formulario` existir são todas do briefing. */
const withForm = (row: Briefing): Briefing => ({ ...row, formulario: toFormId(row.formulario) });

/** Salva as respostas e os arquivos. Retorna o id, ou lança erro se o banco falhar. */
export async function saveBriefing(formulario: FormId, answers: Answers, files: File[]): Promise<string> {
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
    // "briefing" é o padrão da coluna; omitir mantém o briefing salvando mesmo antes da migração.
    ...(formulario === "briefing" ? {} : { formulario }),
    empresa: formulario === "briefing" ? String(answers.empresa ?? "") : null,
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
  return (data as Briefing[]).map(withForm);
}

export async function getBriefing(id: string): Promise<Briefing | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await requireSupabase().from("briefings").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? withForm(data as Briefing) : null;
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
