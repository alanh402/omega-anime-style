import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseEnabled } from "@/config/site";
import { getPublicSupabase } from "@/data/supabase/public-client";
import type { AnalyticsEventType } from "@/lib/types";

const TYPES: AnalyticsEventType[] = [
  "product_view",
  "whatsapp_click",
  "order_sent",
  "add_to_order",
  "remove_from_order",
  "share",
  "category_view",
  "search",
];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : undefined);

/**
 * Recebe eventos de interesse do catálogo.
 * Sem Supabase (modo demonstração) apenas confirma o recebimento.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const type = body.type as AnalyticsEventType;
  if (!TYPES.includes(type)) return NextResponse.json({ ok: false }, { status: 400 });

  if (!isSupabaseEnabled) {
    if (process.env.NODE_ENV === "development") console.info("[analytics]", type, body.productId ?? body.query ?? "");
    return new NextResponse(null, { status: 204 });
  }

  const productId = typeof body.productId === "string" && UUID.test(body.productId) ? body.productId : null;
  const meta = body.meta && typeof body.meta === "object" ? body.meta : {};
  const { error } = await getPublicSupabase()
    .from("events")
    .insert({
      type,
      product_id: productId,
      category_slug: clip(body.categorySlug, 80) ?? null,
      query: clip(body.query, 120) ?? null,
      meta: JSON.stringify(meta).length <= 1500 ? meta : {},
      session_id: clip(body.sessionId, 64) ?? null,
    });
  if (error) console.error("[analytics] falha ao gravar evento:", error.message);
  return new NextResponse(null, { status: 204 });
}
