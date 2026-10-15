-- Banco dos formulários da Linka Mídia (briefing de landing page e processo seletivo).
-- Rode este arquivo inteiro uma vez no Supabase: SQL Editor → New query → cole → Run.
-- Pode rodar de novo sem problema: nada é apagado.

-- Respostas dos formulários (uma linha por envio)
create table if not exists public.briefings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- 'briefing' (landing page) ou 'seletivo' (processo seletivo)
  formulario text not null default 'briefing',
  -- Só o briefing tem empresa; no processo seletivo fica vazio
  empresa text,
  nome text not null,
  email text not null,
  whatsapp text,
  answers jsonb not null,
  -- [{ "name": "logo.png", "path": "<id>/logo.png", "size": 12345 }]
  arquivos jsonb not null default '[]'::jsonb
);
create index if not exists briefings_created_at_idx on public.briefings (created_at desc);

-- Atualiza bancos criados antes do processo seletivo (as respostas antigas viram 'briefing')
alter table public.briefings add column if not exists formulario text not null default 'briefing';
alter table public.briefings alter column empresa drop not null;
create index if not exists briefings_formulario_idx on public.briefings (formulario, created_at desc);

-- Usado pelo agendamento que mantém o projeto ativo (o plano grátis pausa após 7 dias parado)
create table if not exists public.keepalive (
  id int primary key,
  pinged_at timestamptz not null default now(),
  pings bigint not null default 0
);

-- Tentativas de login erradas no painel, para bloquear quem tenta adivinhar a senha
create table if not exists public.login_attempts (
  id bigint generated always as identity primary key,
  ip text not null,
  created_at timestamptz not null default now()
);
create index if not exists login_attempts_ip_idx on public.login_attempts (ip, created_at desc);

-- Segurança: RLS ligado e nenhuma política criada. Assim a chave pública (anon)
-- não lê nem grava nada; só o servidor do site, com a chave secreta, acessa.
alter table public.briefings enable row level security;
alter table public.keepalive enable row level security;
alter table public.login_attempts enable row level security;

-- Arquivos de identidade visual enviados pelos clientes (bucket privado)
insert into storage.buckets (id, name, public, file_size_limit)
values ('briefing-arquivos', 'briefing-arquivos', false, 5242880)
on conflict (id) do nothing;
