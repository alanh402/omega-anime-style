import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Recursos compartilhados pelas imagens Open Graph (prévia do link no WhatsApp) */

const assets = (f: string) => join(process.cwd(), "assets", "og", f);

export async function ogFonts() {
  const [regular, bold, display] = await Promise.all([
    readFile(assets("manrope-latin-500-normal.woff")),
    readFile(assets("manrope-latin-800-normal.woff")),
    readFile(assets("unbounded-latin-700-normal.woff")),
  ]);
  return [
    { name: "Manrope", data: regular, weight: 500 as const, style: "normal" as const },
    { name: "Manrope", data: bold, weight: 800 as const, style: "normal" as const },
    { name: "Unbounded", data: display, weight: 700 as const, style: "normal" as const },
  ];
}

export async function ogAsset(file: string): Promise<string> {
  const buf = await readFile(assets(file));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

/**
 * Converte a imagem do produto em algo que o gerador de OG aceita.
 * Arquivos locais (public/) viram data URI; URLs remotas são usadas diretamente
 * (prefira JPG/PNG no cadastro — WebP não é suportado pelo gerador).
 */
export async function ogProductImage(url?: string): Promise<string | undefined> {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url)) return url;
  try {
    const buf = await readFile(join(process.cwd(), "public", url));
    const mime = url.endsWith(".svg") ? "image/svg+xml" : url.endsWith(".png") ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export const OG_SIZE = { width: 1200, height: 630 };
