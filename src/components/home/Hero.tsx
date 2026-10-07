import Image from "next/image";
import { ArrowRight, MessageCircle, ShoppingBag, Sparkles } from "lucide-react";
import type { StoreSettings } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { whatsappLink } from "@/lib/whatsapp";

const steps = [
  { icon: Sparkles, label: "Escolha" },
  { icon: ShoppingBag, label: "Monte o pedido" },
  { icon: MessageCircle, label: "Feche no WhatsApp" },
];

export function Hero({ settings }: { settings: StoreSettings }) {
  const [line1, ...rest] = settings.hero.title.split("\n");
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="speed-lines pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -right-40 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-gold/10 blur-[120px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 pb-10 pt-8 sm:pt-12 lg:grid-cols-[1.1fr_0.9fr] md:pb-16 lg:px-6 lg:pt-16">
        <div className="min-w-0 animate-fade-up">
          <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gold sm:text-[11px]">
            <span className="h-px w-6 shrink-0 bg-gold" /> {settings.hero.eyebrow}
          </p>
          <h1 className="font-display text-[2.15rem] font-bold leading-[1.05] tracking-tight xs:text-[2.5rem] sm:text-5xl lg:text-6xl">
            {line1}
            {rest.length > 0 && (
              <>
                <br />
                <span className="text-gold-metal">{rest.join(" ")}</span>
              </>
            )}
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted sm:text-base">{settings.hero.subtitle}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/catalogo" size="lg" className="sm:flex-none">
              {settings.hero.primaryCta} <ArrowRight className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink
              href={whatsappLink(settings.whatsappNumber, `Olá! Vim pelo catálogo da ${settings.storeName}.`)}
              variant="outline"
              size="lg"
              className="sm:flex-none"
            >
              <WhatsAppIcon className="h-5 w-5 text-whatsapp" /> {settings.hero.secondaryCta}
            </ButtonLink>
          </div>
          <ol className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-muted sm:gap-3 sm:text-sm">
            {steps.map(({ icon: Icon, label }, i) => (
              <li key={label} className="flex items-center gap-2 sm:gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface-2 text-gold">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {label}
                </span>
                {i < steps.length - 1 && <span className="h-px w-3 bg-line-strong sm:w-6" />}
              </li>
            ))}
          </ol>
        </div>
        <div className="relative hidden lg:block">
          <div className="absolute inset-[12%] rounded-full bg-gold/15 blur-3xl" />
          <Image
            src="/brand/logo-full.webp"
            alt=""
            width={811}
            height={408}
            priority
            className="relative mx-auto w-full max-w-[460px] drop-shadow-[0_20px_40px_rgba(217,169,59,0.25)]"
          />
        </div>
      </div>
    </section>
  );
}
