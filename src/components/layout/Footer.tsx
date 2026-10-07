import Image from "next/image";
import Link from "next/link";
import { AtSign, Clock, MapPin } from "lucide-react";
import type { Category, StoreSettings } from "@/lib/types";
import { whatsappLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/ui/icons";

function formatPhone(n: string) {
  const d = n.replace(/\D/g, "").replace(/^55/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return d;
}

export function Footer({ settings, categories }: { settings: StoreSettings; categories: Category[] }) {
  return (
    <footer className="mt-20 border-t border-line bg-surface/60 pb-24 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div className="space-y-4">
          <Image src="/brand/logo-full.webp" alt={settings.storeName} width={811} height={408} className="h-auto w-44" />
          <p className="max-w-xs text-sm text-muted">{settings.tagline}. Atendimento direto pelo WhatsApp, do primeiro “oi” até a entrega.</p>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-subtle">Categorias</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {categories.slice(0, 10).map((c) => (
              <li key={c.id}>
                <Link href={`/categoria/${c.slug}`} className="text-muted hover:text-gold-bright">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-subtle">Atendimento</h3>
          <ul className="space-y-3 text-sm text-muted">
            <li>
              <a href={whatsappLink(settings.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-whatsapp">
                <WhatsAppIcon className="h-4 w-4 text-whatsapp" /> {formatPhone(settings.whatsappNumber)}
              </a>
            </li>
            {settings.instagram && (
              <li>
                <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-gold-bright">
                  <AtSign className="h-4 w-4" /> @{settings.instagram}
                </a>
              </li>
            )}
            {settings.openingHours && (
              <li className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" /> {settings.openingHours}
              </li>
            )}
            {settings.address && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {settings.address}
              </li>
            )}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-subtle">Como comprar</h3>
          <ol className="space-y-2 text-sm text-muted">
            <li><span className="font-bold text-gold">1.</span> Escolha os produtos no catálogo</li>
            <li><span className="font-bold text-gold">2.</span> Monte seu pedido</li>
            <li><span className="font-bold text-gold">3.</span> Envie pelo WhatsApp e combine pagamento e entrega</li>
          </ol>
          <Link href="/vendedor" className="mt-4 inline-block text-xs text-subtle underline-offset-4 hover:text-muted hover:underline">
            Área do vendedor
          </Link>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-subtle lg:px-6">
          © {new Date().getFullYear()} {settings.storeName}. Preços e disponibilidade sujeitos a confirmação no atendimento.
        </p>
      </div>
    </footer>
  );
}
