import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseEnabled } from "@/config/site";
import { getPublicSupabase } from "@/data/supabase/public-client";

const clip = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);

/**
 * Registra o pedido enviado ao WhatsApp como lead (histórico no /admin).
 * A conversa acontece no WhatsApp; aqui guardamos só o resumo do interesse.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const rawItems = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  const items = rawItems
    .map((i: Record<string, unknown>) => ({
      productId: clip(i.productId, 64),
      name: clip(i.name, 160),
      variant: clip(i.variant, 120),
      quantity: Math.max(1, Math.min(99, Number(i.quantity) || 1)),
      unitPrice: Math.max(0, Number(i.unitPrice) || 0),
    }))
    .filter((i) => i.name);
  if (!items.length) return NextResponse.json({ ok: false }, { status: 400 });

  if (!isSupabaseEnabled) return new NextResponse(null, { status: 204 });

  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const { error } = await getPublicSupabase()
    .from("leads")
    .insert({
      customer_name: clip(body.customerName, 80),
      note: clip(body.note, 500),
      items,
      total,
      session_id: clip(body.sessionId, 64),
    });
  if (error) console.error("[leads] falha ao gravar lead:", error.message);
  return new NextResponse(null, { status: 204 });
}
