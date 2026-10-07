import type { Metadata } from "next";
import { SellerPanel } from "@/components/seller/SellerPanel";
import { Breadcrumbs } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Área do vendedor", robots: { index: false } };

export default function SellerPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 lg:px-6">
      <div className="mb-6 pt-6">
        <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Área do vendedor" }]} />
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">Área do vendedor</h1>
        <p className="mt-2 text-sm text-muted">Atalhos para responder clientes no WhatsApp em segundos.</p>
      </div>
      <SellerPanel />
    </div>
  );
}
