# Briefing de Landing Page — Linka Mídia

Formulário para os clientes da [Linka Mídia](https://www.linkamidia.com.br/) passarem as informações da landing page/site que será criado. Mesma identidade visual e stack do site da Linka (Next.js + CSS Modules).

**Sem banco de dados:** as respostas chegam por **e-mail** (com os arquivos de identidade visual anexados) e o cliente pode avisar a Linka pelo **WhatsApp** ao terminar.

## Como funciona

- 8 seções do briefing padrão da Linka + revisão final, com barra de progresso e validação dos campos obrigatórios.
- Upload de logo/manual de marca (até 4 MB no total) e campo de link para arquivos grandes (Drive, WeTransfer).
- Lista de sites de referência com "o que você gostou em cada um".
- O progresso fica salvo no navegador do cliente: se ele fechar a página, continua de onde parou.
- Ao enviar, a rota `/api/briefing` manda um e-mail formatado para a Linka (o "Responder" vai direto para o cliente) e, opcionalmente, uma cópia para o cliente.
- Se o e-mail falhar, o cliente pode mandar as respostas pelo WhatsApp com um clique.

## Editar as perguntas

Todas as perguntas estão em [`lib/questions.ts`](lib/questions.ts). O formulário, a revisão e o e-mail são montados a partir desse arquivo — basta incluir, remover ou alterar os itens.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha SMTP_* e BRIEFING_TO
npm run dev
```

Acesse http://localhost:3000.

## Publicando na Vercel

1. Importe este repositório na Vercel (Add New → Project).
2. Em **Settings → Environment Variables**, cadastre as variáveis do `.env.example`.
3. Faça o deploy e envie o link para os clientes (dá para usar um subdomínio, ex.: `briefing.linkamidia.com.br`).

> O limite de 4 MB para anexos existe porque a Vercel aceita no máximo 4,5 MB por envio. Arquivos maiores devem ir pelo campo de link.
