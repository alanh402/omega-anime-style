import type { Metadata } from "next";
import { OrderView } from "@/components/order/OrderView";
import { Breadcrumbs } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Seu pedido",
  robots: { index: false },
};

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-6">
      <div className="mb-6 pt-6">
        <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Seu pedido" }]} />
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">Seu pedido está quase pronto</h1>
        <p className="mt-2 text-sm text-muted">Confira os itens e envie para um vendedor da Omega pelo WhatsApp.</p>
      </div>
      <OrderView />
    </div>
  );
}
