# Briefing de Landing Page — Linka Mídia

Formulário para os clientes da [Linka Mídia](https://www.linkamidia.com.br/) passarem as informações da landing page/site que será criado. Mesma identidade visual e stack do site da Linka (Next.js + CSS Modules).

As respostas ficam salvas no **Supabase** e aparecem no **painel administrativo** (`/admin`). Também chegam por **e-mail** (com os arquivos de identidade visual anexados), e o cliente pode avisar a Linka pelo **WhatsApp** ao terminar.

## Como funciona

- 8 seções do briefing padrão da Linka + revisão final, com barra de progresso e validação dos campos obrigatórios.
- Upload de logo/manual de marca (até 4 MB no total) e campo de link para arquivos grandes (Drive, WeTransfer).
- Lista de sites de referência com "o que você gostou em cada um".
- O progresso fica salvo no navegador do cliente: se ele fechar a página, continua de onde parou.
- Ao enviar, a rota `/api/briefing` salva as respostas e os arquivos no Supabase e manda um e-mail formatado para a Linka (o "Responder" vai direto para o cliente) e, opcionalmente, uma cópia para o cliente. Basta um dos dois (banco ou e-mail) funcionar para o envio dar certo.
- Se tudo falhar, o cliente pode mandar as respostas pelo WhatsApp com um clique.

## Painel administrativo (`/admin`)

- Login com uma senha única da equipe, guardada só na variável `ADMIN_PASSWORD` da Vercel. Ela nunca vai para o código, para o GitHub nem para o navegador.
- Depois de 5 senhas erradas, o IP fica bloqueado por 15 minutos. A sessão dura 7 dias; trocar a senha desconecta todo mundo.
- O painel não aparece no Google: as páginas têm `noindex` (meta tag e cabeçalho `X-Robots-Tag`) e nada fica em cache.
- **Resumo:** total de briefings, últimos 7 e 30 dias, e gráfico de briefings por semana.
- **Clientes:** lista com busca. Clicar em um cliente abre todas as respostas dele, os links clicáveis, os arquivos para baixar e os botões de e-mail e WhatsApp.
- **Relatório:** para cada pergunta de múltipla escolha, quantos clientes marcaram cada opção.

## Supabase (configurar uma vez)

1. Crie um projeto em [supabase.com](https://supabase.com) (plano grátis).
2. Abra **SQL Editor → New query**, cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**. Isso cria as tabelas e o bucket privado dos arquivos.
3. Em **Project Settings → API Keys**, copie a URL do projeto e a chave **secreta** (`sb_secret_...` ou a antiga `service_role`) para `SUPABASE_URL` e `SUPABASE_SECRET_KEY`.

As tabelas ficam com RLS ligado e sem políticas: a chave pública não acessa nada, só o servidor do site.

### Supabase sem pausar

O plano grátis pausa o projeto depois de 7 dias sem uso. O [`vercel.json`](vercel.json) agenda um Cron da Vercel que chama `/api/keepalive` a cada 2 dias (12h UTC); a rota grava na tabela `keepalive` e conta quantas vezes rodou. A rota só responde a quem manda o `CRON_SECRET`, que a Vercel envia sozinha. Para conferir, veja a tabela `keepalive` no Supabase ou **Settings → Cron Jobs** na Vercel.

## Editar as perguntas

Todas as perguntas estão em [`lib/questions.ts`](lib/questions.ts). O formulário, a revisão e o e-mail são montados a partir desse arquivo — basta incluir, remover ou alterar os itens.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha SUPABASE_*, ADMIN_PASSWORD, CRON_SECRET, SMTP_* e BRIEFING_TO
npm run dev
```

Acesse http://localhost:3000 (formulário) e http://localhost:3000/admin (painel).

## Publicando na Vercel

1. Importe este repositório na Vercel (Add New → Project).
2. Em **Settings → Environment Variables**, cadastre as variáveis do `.env.example`.
3. Faça o deploy e envie o link para os clientes (dá para usar um subdomínio, ex.: `briefing.linkamidia.com.br`).

> O limite de 4 MB para anexos existe porque a Vercel aceita no máximo 4,5 MB por envio. Arquivos maiores devem ir pelo campo de link.
