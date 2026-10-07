"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/data/supabase/server-client";
import { CATALOG_CACHE_TAG } from "@/data/catalog";
import type { Lead, StoreSettings } from "@/lib/types";

/**
 * Ações do painel. Toda escrita usa a sessão do administrador e é validada
 * novamente pelo banco (RLS + public.is_admin()).
 */

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session.user || !session.isAdmin) throw new Error("Sessão expirada ou sem permissão. Entre novamente.");
  return session.supabase;
}

function refreshCatalog() {
  revalidateTag(CATALOG_CACHE_TAG);
  revalidatePath("/", "layout");
}

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const friendly = (msg: string) =>
  /duplicate key.*slug/i.test(msg)
    ? "Já existe um item com este endereço (slug). Escolha outro."
    : /duplicate key.*sku/i.test(msg)
      ? "Já existe um produto com este SKU."
      : msg;

export async function signOut() {
  const { supabase } = await getAdminSession();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* --------------------------------- Produtos -------------------------------- */

export interface ProductPayload {
  id?: string;
  slug: string;
  sku?: string;
  name: string;
  short_description?: string;
  description?: string;
  brand_id?: string;
  price: number;
  promo_price?: number | null;
  installments_count?: number | null;
  installments_interest_free: boolean;
  stock: number;
  specs: Array<{ label: string; value: string }>;
  option_groups: Array<{ name: string; values: string[] }>;
  tags: string[];
  is_featured: boolean;
  is_new: boolean;
  active: boolean;
  category_ids: string[];
  images: Array<{ url: string; alt?: string }>;
  variants: Array<{ sku?: string; options: Record<string, string>; price?: number | null; promo_price?: number | null; stock: number; image_url?: string }>;
  kit_ids: string[];
}

export async function saveProduct(payload: ProductPayload): Promise<ActionResult> {
  try {
    if (!payload.name?.trim()) return { ok: false, error: "Informe o nome do produto." };
    if (!slugRe.test(payload.slug)) return { ok: false, error: "Endereço (slug) inválido: use letras minúsculas, números e hífens." };
    if (!(payload.price >= 0)) return { ok: false, error: "Preço inválido." };
    if (payload.promo_price != null && payload.promo_price >= payload.price)
      return { ok: false, error: "O preço promocional deve ser menor que o preço normal." };
    if (!payload.category_ids.length) return { ok: false, error: "Escolha ao menos uma categoria." };

    const supabase = await requireAdmin();
    // Com variações, o estoque do produto é a soma delas
    const stock = payload.variants.length ? payload.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0) : payload.stock;
    const { data, error } = await supabase.rpc("admin_save_product", { payload: { ...payload, stock } });
    if (error) return { ok: false, error: friendly(error.message) };
    refreshCatalog();
    return { ok: true, id: data as string };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function setProductActive(id: string, active: boolean): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("products").update({ active }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    refreshCatalog();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    refreshCatalog();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/* ---------------------------- Categorias e marcas --------------------------- */

export interface CategoryPayload {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image_url?: string;
  sort_order: number;
  active: boolean;
}

export async function saveCategory(p: CategoryPayload): Promise<ActionResult> {
  try {
    if (!p.name.trim()) return { ok: false, error: "Informe o nome." };
    if (!slugRe.test(p.slug)) return { ok: false, error: "Slug inválido." };
    const supabase = await requireAdmin();
    const row = { name: p.name.trim(), slug: p.slug, description: p.description || null, icon: p.icon || null, image_url: p.image_url || null, sort_order: p.sort_order, active: p.active };
    const { error } = p.id ? await supabase.from("categories").update(row).eq("id", p.id) : await supabase.from("categories").insert(row);
    if (error) return { ok: false, error: friendly(error.message) };
    refreshCatalog();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    refreshCatalog();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export interface BrandPayload {
  id?: string;
  name: string;
  slug: string;
  logo_url?: string;
  active: boolean;
}

export async function saveBrand(p: BrandPayload): Promise<ActionResult> {
  try {
    if (!p.name.trim()) return { ok: false, error: "Informe o nome." };
    if (!slugRe.test(p.slug)) return { ok: false, error: "Slug inválido." };
    const supabase = await requireAdmin();
    const row = { name: p.name.trim(), slug: p.slug, logo_url: p.logo_url || null, active: p.active };
    const { error } = p.id ? await supabase.from("brands").update(row).eq("id", p.id) : await supabase.from("brands").insert(row);
    if (error) return { ok: false, error: friendly(error.message) };
    refreshCatalog();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteBrand(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    refreshCatalog();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/* ------------------------------ Configurações ------------------------------ */

export async function saveSettings(data: StoreSettings): Promise<ActionResult> {
  try {
    const number = data.whatsappNumber.replace(/\D/g, "");
    if (number.length < 12 || number.length > 13) return { ok: false, error: "WhatsApp inválido. Use DDI + DDD + número, ex.: 5599985531987." };
    const supabase = await requireAdmin();
    const { error } = await supabase.from("settings").upsert({ id: 1, data: { ...data, whatsappNumber: number } });
    if (error) return { ok: false, error: error.message };
    refreshCatalog();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/* ---------------------------------- Leads ---------------------------------- */

export async function updateLeadStatus(id: string, status: Lead["status"]): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/pedidos");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
