# Formulários — Linka Mídia

Plataforma de formulários da [Linka Mídia](https://www.linkamidia.com.br/), com a mesma identidade visual e stack do site da Linka (Next.js + CSS Modules):

| Endereço | Formulário | Perguntas |
| --- | --- | --- |
| `/` | Tela de escolha: a pessoa clica em qual formulário vai preencher | — |
| `/formsbriefing` | Briefing de landing page (clientes) | [`lib/questions.ts`](lib/questions.ts) |
| `/formsseletivo` | Processo seletivo: Gestor(a) de tráfego (candidatos) | [`lib/questions-seletivo.ts`](lib/questions-seletivo.ts) |

As respostas dos dois ficam salvas no mesmo **Supabase** e aparecem no mesmo **painel administrativo** (`/admin`), separadas em abas. Também chegam por **e-mail** (com os arquivos anexados), e a pessoa pode avisar a Linka pelo **WhatsApp** ao terminar.

## Como funciona

- 8 seções do briefing padrão da Linka + revisão final, com barra de progresso e validação dos campos obrigatórios.
- Upload de logo/manual de marca (até 4 MB no total) e campo de link para arquivos grandes (Drive, WeTransfer).
- Lista de sites de referência com "o que você gostou em cada um".
- O progresso fica salvo no navegador do cliente: se ele fechar a página, continua de onde parou.
- Ao enviar, a rota `/api/briefing` salva as respostas e os arquivos no Supabase e manda um e-mail formatado para a Linka (o "Responder" vai direto para o cliente) e, opcionalmente, uma cópia para o cliente. Basta um dos dois (banco ou e-mail) funcionar para o envio dar certo.
- Se tudo falhar, o cliente pode mandar as respostas pelo WhatsApp com um clique.

## Usando no domínio da Linka (www.linkamidia.com.br/formsbriefing)

O app já está preparado para rodar dentro do site da Linka: todo o CSS, JS e imagens ficam em `/forms-static/...` (`assetPrefix` no [`next.config.ts`](next.config.ts)) e o envio vai para `/formsbriefing/enviar` e `/formsseletivo/enviar`. Basta o site principal repassar esses caminhos para este projeto. Se o site da Linka for Next.js na Vercel, adicione no `next.config` dele (troque pelo domínio deste projeto na Vercel):

```js
async rewrites() {
  const FORMS = "https://SEU-PROJETO-DE-FORMS.vercel.app";
  return [
    { source: "/formsbriefing/:path*", destination: `${FORMS}/formsbriefing/:path*` },
    { source: "/formsseletivo/:path*", destination: `${FORMS}/formsseletivo/:path*` },
    { source: "/forms-static/:path*", destination: `${FORMS}/forms-static/:path*` },
  ];
}
```

O painel (`/admin`) continua sendo acessado pelo domínio deste projeto na Vercel.

## Painel administrativo (`/admin`)

- Login com uma senha única da equipe, guardada só na variável `ADMIN_PASSWORD` da Vercel. Ela nunca vai para o código, para o GitHub nem para o navegador.
- Depois de 5 senhas erradas, o IP fica bloqueado por 15 minutos. A sessão dura 7 dias; trocar a senha desconecta todo mundo.
- O painel não aparece no Google: as páginas têm `noindex` (meta tag e cabeçalho `X-Robots-Tag`) e nada fica em cache.
- **Abas:** "Briefings" e "Processo seletivo", cada uma com o seu resumo, lista e relatório.
- **Resumo:** total recebido, últimos 7 e 30 dias, e gráfico por semana.
- **Lista:** com busca. Clicar em um cliente/candidato abre todas as respostas, os links clicáveis, os arquivos para baixar (logo, currículo, portfólio) e os botões de e-mail e WhatsApp.
- **Relatório:** para cada pergunta de múltipla escolha, quantas pessoas marcaram cada opção (no processo seletivo: renda extra, planos para 5 anos e perfil DISC).

## Supabase (configurar uma vez)

1. Crie um projeto em [supabase.com](https://supabase.com) (plano grátis).
2. Abra **SQL Editor → New query**, cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**. Isso cria as tabelas e o bucket privado dos arquivos. O arquivo pode ser rodado de novo sempre que mudar: ele nunca apaga dados.
3. Em **Project Settings → API Keys**, copie a URL do projeto e a chave **secreta** (`sb_secret_...` ou a antiga `service_role`) para `SUPABASE_URL` e `SUPABASE_SECRET_KEY`.

As tabelas ficam com RLS ligado e sem políticas: a chave pública não acessa nada, só o servidor do site.

### Supabase sem pausar

O plano grátis pausa o projeto depois de 7 dias sem uso. O [`vercel.json`](vercel.json) agenda um Cron da Vercel que chama `/api/keepalive` a cada 2 dias (12h UTC); a rota grava na tabela `keepalive` e conta quantas vezes rodou. A rota só responde a quem manda o `CRON_SECRET`, que a Vercel envia sozinha. Para conferir, veja a tabela `keepalive` no Supabase ou **Settings → Cron Jobs** na Vercel.

## Editar as perguntas

As perguntas do briefing estão em [`lib/questions.ts`](lib/questions.ts) e as do processo seletivo em [`lib/questions-seletivo.ts`](lib/questions-seletivo.ts). Os textos de cada formulário (título, mensagem de sucesso, assunto do e-mail, nomes no painel) ficam em [`lib/forms.ts`](lib/forms.ts). O formulário, a revisão, o e-mail e o painel são montados a partir desses arquivos.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha SUPABASE_*, ADMIN_PASSWORD, CRON_SECRET, SMTP_* e BRIEFING_TO
npm run dev
```

Acesse http://localhost:3000 (escolha do formulário) e http://localhost:3000/admin (painel).

## Publicando na Vercel

1. Importe este repositório na Vercel (Add New → Project).
2. Em **Settings → Environment Variables**, cadastre as variáveis do `.env.example`.
3. Faça o deploy e envie os links (`/formsbriefing` para clientes, `/formsseletivo` para candidatos), direto pelo domínio da Vercel ou pelo site da Linka (veja acima).

> O limite de 4 MB para anexos existe porque a Vercel aceita no máximo 4,5 MB por envio. Arquivos maiores devem ir pelo campo de link.
