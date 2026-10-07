"use client";

import { getBrowserSupabase } from "@/data/supabase/browser-client";

const BUCKET = "catalog";

/**
 * Reduz a foto no navegador antes do envio (máx. 1600px, JPEG ~85%).
 * JPEG garante compatibilidade com a prévia de link do WhatsApp; o site
 * entrega WebP/AVIF automaticamente aos visitantes.
 */
async function compress(file: File, maxSize = 1600): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.fillStyle = "#ffffff"; // PNG transparente vira fundo branco no JPEG
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.85));
}

export async function uploadCatalogImage(file: File, folder: "products" | "categories" | "brands" | "banners" = "products"): Promise<string> {
  const blob = await compress(file);
  const ext = blob.type === "image/jpeg" ? "jpg" : (file.name.split(".").pop() ?? "img").toLowerCase();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const supabase = getBrowserSupabase();
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || file.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`Falha no envio da imagem: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
