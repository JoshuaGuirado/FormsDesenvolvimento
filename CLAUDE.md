# Instruções para o Claude

## Git: sempre direto na `main`

- Ao terminar qualquer alteração, faça o commit e o push direto para a `main` (`git push origin HEAD:main`), sem pedir confirmação.
- Não abra pull request e não espere merge. Se a sessão estiver em outra branch, envie para ela também, mas a `main` precisa sempre receber o commit.
- Antes do push, rode `npm run build` e só envie se passar.
- Se a `main` tiver commits novos no GitHub, traga-os antes (`git pull --rebase origin main`) e então envie.
- Mensagens de commit em português, no estilo do histórico (ex.: "Adiciona ...", "Corrige ...").

## Projeto

- Formulários da Linka Mídia (Next.js + CSS Modules), publicados na Vercel a partir da `main`: briefing de landing page (`/formsbriefing`) e processo seletivo (`/formsseletivo`). A raiz `/` é a tela de escolha.
- Perguntas em `lib/questions.ts` (briefing) e `lib/questions-seletivo.ts` (processo seletivo); textos de cada formulário em `lib/forms.ts`. Respostas dos dois na mesma tabela do Supabase (`supabase/schema.sql`, coluna `formulario`) e enviadas por e-mail.
- O `assetPrefix` (`/forms-static`) existe para os formulários rodarem dentro de www.linkamidia.com.br via rewrite; links e chamadas internas dos formulários devem ficar sob `/formsbriefing`, `/formsseletivo` ou `/forms-static`.
- Mudanças no banco: atualize o `supabase/schema.sql` sem apagar dados (`if not exists`) e passe o SQL para o usuário rodar no SQL Editor.
- Painel administrativo em `/admin`, protegido pela variável `ADMIN_PASSWORD`. Nunca coloque senhas ou chaves no código.
