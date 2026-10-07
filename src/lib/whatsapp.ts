import type { CartItem, StoreSettings } from "./types";
import { formatBRL } from "./pricing";

/**
 * Integração com WhatsApp via link oficial (wa.me).
 * Funciona em celular (abre o app) e desktop (WhatsApp Web/Desktop).
 * O número vem SEMPRE das configurações da loja — nunca espalhado pelo código.
 */

export function sanitizeNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function whatsappLink(number: string, text?: string): string {
  const base = `https://wa.me/${sanitizeNumber(number)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Link de compartilhamento sem destinatário — o usuário escolhe o contato */
export function whatsappShareLink(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export interface OrderMessageInput {
  items: CartItem[];
  settings: Pick<StoreSettings, "orderMessage" | "storeName">;
  siteUrl: string;
  customerName?: string;
  note?: string;
}

export function orderTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

export function buildOrderMessage({ items, settings, siteUrl, customerName, note }: OrderMessageInput): string {
  const lines: string[] = [];
  const greeting = settings.orderMessage.greeting.replace("{loja}", settings.storeName);
  lines.push(customerName ? `${greeting}\nMeu nome é ${customerName.trim()}.` : greeting);
  lines.push("");
  lines.push("*Produtos:*");
  items.forEach((item, idx) => {
    lines.push("");
    lines.push(`${idx + 1}. *${item.name}*`);
    if (item.variantLabel) lines.push(`   Opção: ${item.variantLabel}`);
    lines.push(`   Quantidade: ${item.quantity}`);
    lines.push(
      item.quantity > 1
        ? `   Valor: ${formatBRL(item.unitPrice)} cada (${formatBRL(item.unitPrice * item.quantity)})`
        : `   Valor: ${formatBRL(item.unitPrice)}`,
    );
    lines.push(`   ${siteUrl.replace(/\/$/, "")}/produto/${item.slug}`);
  });
  lines.push("");
  lines.push(`*Total estimado: ${formatBRL(orderTotal(items))}*`);
  if (note?.trim()) {
    lines.push("");
    lines.push(`Observação: ${note.trim()}`);
  }
  lines.push("");
  lines.push(settings.orderMessage.closing);
  return lines.join("\n");
}

export function buildQuickBuyMessage(opts: {
  productName: string;
  variantLabel?: string;
  price: number;
  url: string;
  settings: Pick<StoreSettings, "storeName">;
}): string {
  const opt = opts.variantLabel ? ` (${opts.variantLabel})` : "";
  return [
    `Olá! Vim pelo catálogo da ${opts.settings.storeName} e tenho interesse neste produto:`,
    "",
    `*${opts.productName}*${opt}`,
    `Valor: ${formatBRL(opts.price)}`,
    opts.url,
    "",
    "Está disponível? Quais as condições de pagamento?",
  ].join("\n");
}

export function buildShareMessage(template: string, productName: string, url: string): string {
  return `${template.replace("{produto}", productName)}\n\n*${productName}*\n${url}`;
}
