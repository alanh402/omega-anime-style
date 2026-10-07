-- =============================================================================
-- Omega Anime Style — esquema do catálogo
-- Execute no SQL Editor do Supabase (ou `supabase db push`).
-- =============================================================================


-- ---------------------------------------------------------------------------
-- Administradores (usuários do Supabase Auth com acesso ao /admin)
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  description text,
  icon text,
  image_url text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  logo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  sku text unique,
  name text not null,
  short_description text,
  description text,
  brand_id uuid references public.brands (id) on delete set null,
  price numeric(12, 2) not null check (price >= 0),
  promo_price numeric(12, 2) check (promo_price is null or promo_price >= 0),
  installments_count int check (installments_count is null or installments_count between 1 and 24),
  installments_interest_free boolean not null default true,
  stock int not null default 0,
  -- [{ "label": "Tela", "value": "6,1\"" }]
  specs jsonb not null default '[]'::jsonb,
  -- [{ "name": "Cor", "values": ["Preto", "Azul"] }]
  option_groups jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  is_new boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_active_idx on public.products (active, created_at desc);
create index if not exists products_brand_idx on public.products (brand_id);

-- Um produto pode estar em várias categorias (ex.: iPhone → Smartphones e Apple).
-- position = 0 indica a categoria principal.
create table if not exists public.product_categories (
  product_id uuid not null references public.products (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  position int not null default 0,
  primary key (product_id, category_id)
);
create index if not exists product_categories_category_idx on public.product_categories (category_id);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  alt text,
  position int not null default 0
);
create index if not exists product_images_product_idx on public.product_images (product_id, position);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text,
  -- { "Armazenamento": "128 GB", "Cor": "Azul" }
  options jsonb not null default '{}'::jsonb,
  price numeric(12, 2) check (price is null or price >= 0),
  promo_price numeric(12, 2) check (promo_price is null or promo_price >= 0),
  stock int not null default 0,
  -- foto mostrada quando esta variação é escolhida (opcional)
  image_url text,
  position int not null default 0
);
create index if not exists product_variants_product_idx on public.product_variants (product_id, position);

-- "Monte seu kit": produtos sugeridos como complemento
create table if not exists public.product_relations (
  product_id uuid not null references public.products (id) on delete cascade,
  related_id uuid not null references public.products (id) on delete cascade,
  position int not null default 0,
  primary key (product_id, related_id),
  check (product_id <> related_id)
);

-- Configurações da loja (linha única). Ver StoreSettings em src/lib/types.ts
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Leads (pedidos enviados ao WhatsApp) e eventos de analytics
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text check (char_length(customer_name) <= 80),
  note text check (char_length(note) <= 500),
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 50),
  total numeric(12, 2) not null default 0,
  status text not null default 'novo' check (status in ('novo', 'em_atendimento', 'vendido', 'perdido')),
  session_id text check (char_length(session_id) <= 64)
);
create index if not exists leads_created_idx on public.leads (created_at desc);

create table if not exists public.events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  type text not null check (type in (
    'product_view', 'whatsapp_click', 'order_sent', 'add_to_order',
    'remove_from_order', 'share', 'category_view', 'search'
  )),
  product_id uuid references public.products (id) on delete set null,
  category_slug text check (char_length(category_slug) <= 80),
  query text check (char_length(query) <= 120),
  meta jsonb not null default '{}'::jsonb check (pg_column_size(meta) <= 2048),
  session_id text check (char_length(session_id) <= 64)
);
create index if not exists events_type_created_idx on public.events (type, created_at desc);
create index if not exists events_product_idx on public.events (product_id, type);

-- Atualiza updated_at automaticamente
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Métricas por produto (para o dashboard; acesso restrito a admins via RLS de events)
-- ---------------------------------------------------------------------------
create or replace view public.product_event_stats
with (security_invoker = true) as
select
  product_id,
  count(*) filter (where type = 'product_view') as views,
  count(*) filter (where type = 'add_to_order') as adds,
  count(*) filter (where type = 'whatsapp_click') as whatsapp_clicks,
  count(*) filter (where type = 'share') as shares
from public.events
where product_id is not null
group by product_id;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_relations enable row level security;
alter table public.settings enable row level security;
alter table public.leads enable row level security;
alter table public.events enable row level security;

-- Admins: cada admin vê o próprio registro. Novos admins são inseridos pelo SQL Editor.
drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select using (user_id = auth.uid());

-- Leitura pública somente do que está ativo; admins leem e escrevem tudo.
drop policy if exists "public read active categories" on public.categories;
create policy "public read active categories" on public.categories for select using (active or public.is_admin());
drop policy if exists "admin write categories" on public.categories;
create policy "admin write categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read active brands" on public.brands;
create policy "public read active brands" on public.brands for select using (active or public.is_admin());
drop policy if exists "admin write brands" on public.brands;
create policy "admin write brands" on public.brands for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select using (active or public.is_admin());
drop policy if exists "admin write products" on public.products;
create policy "admin write products" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- Tabelas filhas: visíveis quando o produto pai é visível
do $$
declare t text;
begin
  foreach t in array array['product_categories', 'product_images', 'product_variants', 'product_relations'] loop
    execute format('drop policy if exists "public read %1$s" on public.%1$I', t);
    execute format(
      'create policy "public read %1$s" on public.%1$I for select using (
         exists (select 1 from public.products p where p.id = product_id and (p.active or public.is_admin()))
       )', t);
    execute format('drop policy if exists "admin write %1$s" on public.%1$I', t);
    execute format(
      'create policy "admin write %1$s" on public.%1$I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists "public read settings" on public.settings;
create policy "public read settings" on public.settings for select using (true);
drop policy if exists "admin write settings" on public.settings;
create policy "admin write settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- Visitantes só podem INSERIR leads/eventos (nunca ler). Admins leem e atualizam.
drop policy if exists "anyone insert leads" on public.leads;
create policy "anyone insert leads" on public.leads for insert with check (status = 'novo');
drop policy if exists "admin manage leads" on public.leads;
create policy "admin manage leads" on public.leads for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "anyone insert events" on public.events;
create policy "anyone insert events" on public.events for insert with check (true);
drop policy if exists "admin read events" on public.events;
create policy "admin read events" on public.events for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: bucket público para imagens de produtos, categorias e marcas
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('catalog', 'catalog', true)
on conflict (id) do nothing;

drop policy if exists "public read catalog files" on storage.objects;
create policy "public read catalog files" on storage.objects for select using (bucket_id = 'catalog');
drop policy if exists "admin write catalog files" on storage.objects;
create policy "admin write catalog files" on storage.objects for all
  using (bucket_id = 'catalog' and public.is_admin())
  with check (bucket_id = 'catalog' and public.is_admin());
