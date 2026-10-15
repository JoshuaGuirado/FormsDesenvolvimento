# Formulários — Linka Mídia

Plataforma de formulários da [Linka Mídia](https://www.linkamidia.com.br/), com a mesma identidade visual e stack do site da Linka (Next.js + CSS Modules):

| Endereço | Formulário | Perguntas |
| --- | --- | --- |
| `/forms` | Tela de escolha: a pessoa clica em qual formulário vai preencher | — |
| `/forms/briefing` | Briefing de landing page (clientes) | [`lib/questions.ts`](lib/questions.ts) |
| `/forms/seletivo` | Processo seletivo (candidatos escolhem a vaga no topo; o link `?vaga=designer` já vem com a vaga marcada) | [`lib/questions-seletivo.ts`](lib/questions-seletivo.ts) |

As respostas dos dois ficam salvas no mesmo **Supabase** e aparecem no mesmo **painel administrativo** (`/forms/admin`), separadas em abas. Também chegam por **e-mail** (com os arquivos anexados), e a pessoa pode avisar a Linka pelo **WhatsApp** ao terminar.

## Como funciona

- 8 seções do briefing padrão da Linka + revisão final, com barra de progresso e validação dos campos obrigatórios.
- Upload de logo/manual de marca (até 4 MB no total) e campo de link para arquivos grandes (Drive, WeTransfer).
- Lista de sites de referência com "o que você gostou em cada um".
- O progresso fica salvo no navegador do cliente: se ele fechar a página, continua de onde parou.
- Ao enviar, a rota `/forms/briefing/enviar` (ou `/forms/seletivo/enviar`) salva as respostas e os arquivos no Supabase e manda um e-mail formatado para a Linka (o "Responder" vai direto para o cliente) e, opcionalmente, uma cópia para o cliente. Basta um dos dois (banco ou e-mail) funcionar para o envio dar certo.
- Se tudo falhar, o cliente pode mandar as respostas pelo WhatsApp com um clique.

## Usando no domínio da Linka (www.linkamidia.com.br/forms)

Todo o app fica sob `/forms` (`basePath` no [`next.config.ts`](next.config.ts)): páginas, painel, envio e arquivos. O site da Linka (`linka-midia-site`) só repassa esse caminho para este projeto no `vercel.json` dele:

```json
{ "source": "/forms/:path*", "destination": "https://formslinka.vercel.app/forms/:path*" }
```

Endereços finais: `www.linkamidia.com.br/forms/briefing`, `/forms/seletivo` e `/forms/admin`. Os endereços antigos (`/formsbriefing`, `/formsseletivo`, `/admin`) redirecionam para os novos.

## Painel administrativo (`/forms/admin`)

- Login com uma senha única da equipe, guardada só na variável `ADMIN_PASSWORD` da Vercel. Ela nunca vai para o código, para o GitHub nem para o navegador.
- Depois de 5 senhas erradas, o IP fica bloqueado por 15 minutos. A sessão dura 7 dias; trocar a senha desconecta todo mundo.
- O painel não aparece no Google: as páginas têm `noindex` (meta tag e cabeçalho `X-Robots-Tag`) e nada fica em cache.
- **Abas:** "Briefings" e "Processo seletivo", cada uma com o seu resumo, lista e relatório. No processo seletivo, dá para filtrar por vaga.
- **Resumo:** total recebido, últimos 7 e 30 dias, e gráfico por semana.
- **Lista:** com busca. Clicar em um cliente/candidato abre todas as respostas, os links clicáveis, os arquivos para baixar (logo, currículo, portfólio) e os botões de e-mail e WhatsApp.
- **Relatório:** para cada pergunta de múltipla escolha, quantas pessoas marcaram cada opção (no processo seletivo: vaga, renda extra, planos para 5 anos e perfil DISC).

## Supabase (configurar uma vez)

1. Crie um projeto em [supabase.com](https://supabase.com) (plano grátis).
2. Abra **SQL Editor → New query**, cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**. Isso cria as tabelas e o bucket privado dos arquivos. O arquivo pode ser rodado de novo sempre que mudar: ele nunca apaga dados.
3. Em **Project Settings → API Keys**, copie a URL do projeto e a chave **secreta** (`sb_secret_...` ou a antiga `service_role`) para `SUPABASE_URL` e `SUPABASE_SECRET_KEY`.

As tabelas ficam com RLS ligado e sem políticas: a chave pública não acessa nada, só o servidor do site.

### Supabase sem pausar

O plano grátis pausa o projeto depois de 7 dias sem uso. O [`vercel.json`](vercel.json) agenda um Cron da Vercel que chama `/forms/api/keepalive` a cada 2 dias (12h UTC); a rota grava na tabela `keepalive` e conta quantas vezes rodou. A rota só responde a quem manda o `CRON_SECRET`, que a Vercel envia sozinha. Para conferir, veja a tabela `keepalive` no Supabase ou **Settings → Cron Jobs** na Vercel.

## Editar as perguntas

As perguntas do briefing estão em [`lib/questions.ts`](lib/questions.ts) e as do processo seletivo em [`lib/questions-seletivo.ts`](lib/questions-seletivo.ts). Os textos de cada formulário (título, mensagem de sucesso, assunto do e-mail, nomes no painel) ficam em [`lib/forms.ts`](lib/forms.ts). O formulário, a revisão, o e-mail e o painel são montados a partir desses arquivos.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha SUPABASE_*, ADMIN_PASSWORD, CRON_SECRET, SMTP_* e BRIEFING_TO
npm run dev
```

Acesse http://localhost:3000/forms (escolha do formulário) e http://localhost:3000/forms/admin (painel).

## Publicando na Vercel

1. Importe este repositório na Vercel (Add New → Project).
2. Em **Settings → Environment Variables**, cadastre as variáveis do `.env.example`.
3. Faça o deploy e envie os links (`www.linkamidia.com.br/forms/briefing` para clientes, `www.linkamidia.com.br/forms/seletivo` para candidatos).

> O limite de 4 MB para anexos existe porque a Vercel aceita no máximo 4,5 MB por envio. Arquivos maiores devem ir pelo campo de link.
