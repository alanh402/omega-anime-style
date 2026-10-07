import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { whatsappLink } from "@/lib/whatsapp";

/** Chamada final: para quem não achou o produto ou quer ajuda para escolher */
export function WhatsAppCta({ number, storeName }: { number: string; storeName: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-14 lg:px-6">
      <div className="speed-lines relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-10 text-center sm:px-10">
        <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-whatsapp/10 blur-3xl" />
        <h2 className="relative font-display text-xl font-bold sm:text-2xl">Não encontrou o que procura?</h2>
        <p className="relative mx-auto mt-2 max-w-md text-sm text-muted">
          Chegam produtos novos toda semana. Chame no WhatsApp que a gente procura para você.
        </p>
        <ButtonLink
          href={whatsappLink(number, `Olá! Vim pelo catálogo da ${storeName} e estou procurando um produto.`)}
          variant="whatsapp"
          size="lg"
          className="relative mt-6"
        >
          <WhatsAppIcon className="h-5 w-5" /> Falar com um vendedor
        </ButtonLink>
      </div>
    </section>
  );
}
