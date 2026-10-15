# Instruções para o Claude

## Git: sempre direto na `main`

- Ao terminar qualquer alteração, faça o commit e o push direto para a `main` (`git push origin HEAD:main`), sem pedir confirmação.
- Não abra pull request e não espere merge. Se a sessão estiver em outra branch, envie para ela também, mas a `main` precisa sempre receber o commit.
- Antes do push, rode `npm run build` e só envie se passar.
- Se a `main` tiver commits novos no GitHub, traga-os antes (`git pull --rebase origin main`) e então envie.
- Mensagens de commit em português, no estilo do histórico (ex.: "Adiciona ...", "Corrige ...").

## Projeto

- Formulários da Linka Mídia (Next.js + CSS Modules), publicados na Vercel a partir da `main`: briefing de landing page (`/forms/briefing`) e processo seletivo (`/forms/seletivo`). A tela de escolha fica em `/forms`.
- Perguntas em `lib/questions.ts` (briefing) e `lib/questions-seletivo.ts` (processo seletivo); textos de cada formulário em `lib/forms.ts`. As vagas do processo seletivo ficam na lista `VAGAS` de `lib/questions-seletivo.ts`. Respostas dos dois na mesma tabela do Supabase (`supabase/schema.sql`, coluna `formulario`) e enviadas por e-mail.
- Todo o app fica sob o `basePath` `/forms` (`next.config.ts` e `lib/base-path.ts`), para rodar em www.linkamidia.com.br/forms/... via rewrite do site da Linka (repositório `linka-midia-site`). `Link` e `redirect()` já somam o `/forms`; em `<a>`, `<img>` e `fetch()` use `withBase()`.
- Mudanças no banco: atualize o `supabase/schema.sql` sem apagar dados (`if not exists`) e passe o SQL para o usuário rodar no SQL Editor.
- Painel administrativo em `/forms/admin`, protegido pela variável `ADMIN_PASSWORD`. Nunca coloque senhas ou chaves no código.
