# Omega Anime Style — Catálogo comercial com pedido pelo WhatsApp

Vitrine digital da **Omega Anime Style**: o cliente navega, monta o pedido e envia tudo organizado para o WhatsApp da loja. Não há checkout nem pagamento online. A venda é fechada pelo vendedor na conversa.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Estilo | Tailwind CSS 4 com tokens próprios (`src/app/globals.css`) |
| Dados | Supabase (Postgres + Storage + Auth), com modo demonstração sem banco |
| Ícones | lucide-react |
| Fontes | Unbounded (títulos) e Manrope (texto), servidas localmente |

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # opcional: sem Supabase roda com dados de demonstração
npm run dev                  # http://localhost:3000
```

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm run build` / `npm start` | build e servidor de produção |
| `npm test` | testes de WhatsApp, preços, variações, busca e filtros |
| `npm run typecheck` / `npm run lint` | checagens de tipos e lint |
| `npm run demo:art` | regenera as ilustrações dos produtos de demonstração |
| `npm run db:seed-sql` | regenera `supabase/seed.sql` e `supabase/seed-demo-products.sql` |

## Páginas

| Rota | Conteúdo |
|---|---|
| `/` | Home: hero, categorias, destaques, coleções, ofertas e novidades |
| `/catalogo` | Catálogo com busca, filtros (categoria, marca, preço, oferta, disponível, novo, destaque) e ordenação. Os filtros ficam na URL, então qualquer busca pode ser compartilhada. |
| `/categoria/[slug]` | Categoria, ex.: `/categoria/iphone`, `/categoria/ps5` |
| `/colecao/[slug]` | Coleção baseada em etiqueta, ex.: `/colecao/setup-gamer` |
| `/produto/[slug]` | Produto: galeria, variações, quantidade, WhatsApp, compartilhar, “Monte seu kit” e relacionados |
| `/pedido` | “Seu pedido”: quantidades, nome e observação opcionais, envio pelo WhatsApp |
| `/vendedor` | Modo vendedor: botão “Copiar” em todos os cards (vale para o aparelho onde foi ativado) |
| `/admin` | Painel administrativo (requer Supabase) |

## Fluxo do vendedor (em segundos)

1. O cliente pergunta: “tem iPhone?”
2. O vendedor toca em **Buscar** e digita “iphone”.
3. No card (com o modo vendedor ativo) toca em **Copiar**. Isso copia “Temos esse modelo aqui 👇” junto com o link.
4. O vendedor cola na conversa. O link mostra foto, nome e preço (Open Graph).
5. O cliente monta o pedido e toca em **Enviar pedido pelo WhatsApp**. A mensagem chega organizada.

## Estrutura

```
src/
  app/(store)/        páginas públicas (layout com header, barra inferior, busca)
  app/admin/          painel (login, dashboard, produtos, categorias, marcas, leads, configurações)
  app/api/            search (busca instantânea), events (analytics), leads (pedidos enviados)
  components/         ui/ (design system), layout/, home/, catalog/, product/, order/, admin/
  config/             default-settings.ts (textos e WhatsApp padrão), site.ts (ambiente)
  data/
    catalog.ts        ÚNICA porta de dados das páginas (escolhe demo ou Supabase)
    demo/             ⚠️ CONTEÚDO DE DEMONSTRAÇÃO, separado do sistema real
    supabase/         clientes e mapeamento das tabelas
  lib/                regras puras: preços, variações, busca, mensagem do WhatsApp
  store/              estado do pedido, overlays e modo vendedor
supabase/
  migrations/         esquema, RLS, storage e função de salvar produto
  seed.sql            categorias, marcas e configurações iniciais
  seed-demo-products.sql  produtos de demonstração (opcional)
```

### Demonstração e dados reais

Sem `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`, o site usa `src/data/demo/` e mostra a faixa “Demonstração”. Com as variáveis configuradas, tudo vem do banco e a pasta demo deixa de ser usada. Nenhuma tela lê dados diretamente; tudo passa por `src/data/catalog.ts`.

## Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode em ordem:
   1. `supabase/migrations/0001_catalog_schema.sql`
   2. `supabase/migrations/0002_admin_functions.sql`
   3. `supabase/seed.sql` (categorias, marcas e configurações)
   4. Opcional: `supabase/seed-demo-products.sql`, para começar com os produtos de exemplo. Para removê-los depois: `delete from products where 'demo' = any(tags);`
3. Em **Project Settings → API**, copie a URL e a chave `anon` para `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Crie o primeiro administrador:
   1. Em **Authentication → Users → Add user**, crie o usuário com e-mail e senha.
   2. Copie o ID do usuário e rode no SQL Editor:
      ```sql
      insert into admins (user_id) values ('ID-DO-USUÁRIO');
      ```
5. Recomendado: em **Authentication → Sign In / Providers**, desative “Allow new users to sign up”. Assim só você cria contas.

### Segurança

- **RLS ativo em todas as tabelas.** Visitantes só leem o que está ativo e só conseguem *inserir* eventos e leads, nunca lê-los.
- **Escritas só para administradores.** Toda escrita exige um usuário cadastrado em `admins`, verificado pela função `is_admin()`.
- **Chave `service_role` fora do site.** O site usa apenas a chave pública (`anon`).
- **Imagens no bucket público `catalog`.** Só administradores enviam ou removem arquivos.

## Painel `/admin`

| Área | O que permite |
|---|---|
| Dashboard | Totais de produtos, ofertas e esgotados. Nos últimos 30 dias: visualizações, cliques no WhatsApp, adições, pedidos enviados e conversão. Também mostra os mais vistos, os mais adicionados, as buscas mais feitas e as categorias mais acessadas. |
| Produtos | Cadastro completo: fotos com upload e compressão automática, preço e promoção, parcelamento, estoque, categorias (a primeira é a principal), variações com preço, estoque e foto próprios, especificações, etiquetas, selos, kit sugerido e visibilidade. |
| Categorias / Marcas | Criar, editar, ordenar e ocultar. |
| Pedidos / Leads | Cada pedido enviado ao WhatsApp, com status (novo, em atendimento, vendido, perdido). |
| Configurações | Nome, WhatsApp, Instagram, endereço, horário, textos da Home, mensagens do WhatsApp e coleções/banners. |

Ao salvar, o site atualiza na hora. Sem ações do painel, as páginas se renovam a cada 60 segundos.

## WhatsApp

- **Número central.** Fica em `/admin/configuracoes`, com fallback para `NEXT_PUBLIC_WHATSAPP_NUMBER` e depois para `src/config/default-settings.ts`. Nunca está espalhado pelo código.
- **Link oficial.** Usa `https://wa.me/<número>?text=<mensagem codificada>`, que abre o app no celular e o WhatsApp Web/Desktop no computador.
- **Código da mensagem.** Fica em `src/lib/whatsapp.ts` e é coberto pelos testes.

## Prévia do link (Open Graph)

Cada produto gera uma imagem 1200×630 com foto, nome, preço e o selo “Peça pelo WhatsApp” (`src/app/(store)/produto/[slug]/opengraph-image.tsx`).

**Importante:** defina `NEXT_PUBLIC_SITE_URL` com o domínio final. É ele que aparece nos links e nas prévias.

O upload do admin converte as fotos para JPEG, um formato que a prévia aceita. Evite cadastrar URLs externas em WebP como capa.

## Publicar (Vercel)

1. Suba o projeto para um repositório no GitHub.
2. Em [vercel.com](https://vercel.com), escolha **Add New → Project** e importe o repositório.
3. Em **Environment Variables**, adicione as variáveis de `.env.example`.
4. Faça o deploy e configure o domínio próprio em **Settings → Domains**.

## Próximos passos sugeridos

A arquitetura já comporta, sem reescrever telas:

- cupons
- múltiplos vendedores (com um número por vendedor e links com `?v=`)
- notificações de lead
- integração com Instagram Shopping
- relatórios por período
- histórico de pedidos por cliente (CRM)
