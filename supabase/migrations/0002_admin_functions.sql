-- =============================================================================
-- Salva um produto completo (dados + categorias + imagens + variações + kit)
-- em UMA transação. Chamado pelo /admin. Só administradores executam.
-- =============================================================================

create or replace function public.admin_save_product(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  pid uuid;
  item jsonb;
  pos int;
begin
  if not public.is_admin() then
    raise exception 'acesso negado' using errcode = '42501';
  end if;

  pid := nullif(payload ->> 'id', '')::uuid;

  if pid is null then
    insert into products (slug, sku, name, short_description, description, brand_id, price, promo_price,
      installments_count, installments_interest_free, stock, specs, option_groups, tags, is_featured, is_new, active)
    values (
      payload ->> 'slug', nullif(payload ->> 'sku', ''), payload ->> 'name',
      nullif(payload ->> 'short_description', ''), nullif(payload ->> 'description', ''),
      nullif(payload ->> 'brand_id', '')::uuid,
      (payload ->> 'price')::numeric, nullif(payload ->> 'promo_price', '')::numeric,
      nullif(payload ->> 'installments_count', '')::int, coalesce((payload ->> 'installments_interest_free')::boolean, true),
      coalesce((payload ->> 'stock')::int, 0),
      coalesce(payload -> 'specs', '[]'::jsonb), coalesce(payload -> 'option_groups', '[]'::jsonb),
      coalesce(array(select jsonb_array_elements_text(payload -> 'tags')), '{}'),
      coalesce((payload ->> 'is_featured')::boolean, false), coalesce((payload ->> 'is_new')::boolean, false),
      coalesce((payload ->> 'active')::boolean, true)
    )
    returning id into pid;
  else
    update products set
      slug = payload ->> 'slug',
      sku = nullif(payload ->> 'sku', ''),
      name = payload ->> 'name',
      short_description = nullif(payload ->> 'short_description', ''),
      description = nullif(payload ->> 'description', ''),
      brand_id = nullif(payload ->> 'brand_id', '')::uuid,
      price = (payload ->> 'price')::numeric,
      promo_price = nullif(payload ->> 'promo_price', '')::numeric,
      installments_count = nullif(payload ->> 'installments_count', '')::int,
      installments_interest_free = coalesce((payload ->> 'installments_interest_free')::boolean, true),
      stock = coalesce((payload ->> 'stock')::int, 0),
      specs = coalesce(payload -> 'specs', '[]'::jsonb),
      option_groups = coalesce(payload -> 'option_groups', '[]'::jsonb),
      tags = coalesce(array(select jsonb_array_elements_text(payload -> 'tags')), '{}'),
      is_featured = coalesce((payload ->> 'is_featured')::boolean, false),
      is_new = coalesce((payload ->> 'is_new')::boolean, false),
      active = coalesce((payload ->> 'active')::boolean, true)
    where id = pid;
    if not found then
      raise exception 'produto não encontrado';
    end if;
  end if;

  -- Filhos: substitui o conjunto inteiro (simples e consistente)
  delete from product_categories where product_id = pid;
  pos := 0;
  for item in select * from jsonb_array_elements(coalesce(payload -> 'category_ids', '[]'::jsonb)) loop
    insert into product_categories (product_id, category_id, position) values (pid, (item #>> '{}')::uuid, pos);
    pos := pos + 1;
  end loop;

  delete from product_images where product_id = pid;
  pos := 0;
  for item in select * from jsonb_array_elements(coalesce(payload -> 'images', '[]'::jsonb)) loop
    insert into product_images (product_id, url, alt, position) values (pid, item ->> 'url', nullif(item ->> 'alt', ''), pos);
    pos := pos + 1;
  end loop;

  delete from product_variants where product_id = pid;
  pos := 0;
  for item in select * from jsonb_array_elements(coalesce(payload -> 'variants', '[]'::jsonb)) loop
    insert into product_variants (product_id, sku, options, price, promo_price, stock, image_url, position)
    values (pid, nullif(item ->> 'sku', ''), coalesce(item -> 'options', '{}'::jsonb),
      nullif(item ->> 'price', '')::numeric, nullif(item ->> 'promo_price', '')::numeric,
      coalesce((item ->> 'stock')::int, 0), nullif(item ->> 'image_url', ''), pos);
    pos := pos + 1;
  end loop;

  delete from product_relations where product_id = pid;
  pos := 0;
  for item in select * from jsonb_array_elements(coalesce(payload -> 'kit_ids', '[]'::jsonb)) loop
    if (item #>> '{}')::uuid <> pid then
      insert into product_relations (product_id, related_id, position) values (pid, (item #>> '{}')::uuid, pos)
      on conflict do nothing;
      pos := pos + 1;
    end if;
  end loop;

  return pid;
end;
$$;

revoke all on function public.admin_save_product(jsonb) from public, anon;
grant execute on function public.admin_save_product(jsonb) to authenticated;
