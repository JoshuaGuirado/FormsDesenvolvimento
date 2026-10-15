# Instruções para o Claude

## Git: sempre direto na `main`

- Ao terminar qualquer alteração, faça o commit e o push direto para a `main` (`git push origin HEAD:main`), sem pedir confirmação.
- Não abra pull request e não espere merge. Se a sessão estiver em outra branch, envie para ela também, mas a `main` precisa sempre receber o commit.
- Antes do push, rode `npm run build` e só envie se passar.
- Se a `main` tiver commits novos no GitHub, traga-os antes (`git pull --rebase origin main`) e então envie.
- Mensagens de commit em português, no estilo do histórico (ex.: "Adiciona ...", "Corrige ...").

## Projeto

- Formulário de briefing da Linka Mídia (Next.js + CSS Modules), publicado na Vercel a partir da `main`.
- Perguntas em `lib/questions.ts`; respostas salvas no Supabase (`supabase/schema.sql`) e enviadas por e-mail.
- Painel administrativo em `/admin`, protegido pela variável `ADMIN_PASSWORD`. Nunca coloque senhas ou chaves no código.
