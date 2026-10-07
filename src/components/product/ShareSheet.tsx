"use client";

import { useEffect, useState } from "react";
import { Check, Copy, MessageSquareText, Share2 } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { WhatsAppIcon } from "@/components/ui/icons";
import { useStoreConfig } from "@/store/store-config";
import { absoluteUrl, canNativeShare, copyText, nativeShare } from "@/lib/share";
import { buildShareMessage, whatsappShareLink } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";

interface Props {
  open: boolean;
  onClose: () => void;
  productId: string;
  slug: string;
  name: string;
}

/**
 * Compartilhar produto: WhatsApp, copiar link, copiar mensagem pronta (vendedor)
 * e o compartilhamento nativo do celular quando disponível.
 */
export function ShareSheet({ open, onClose, productId, slug, name }: Props) {
  const { siteUrl, shareMessage } = useStoreConfig();
  const [copied, setCopied] = useState<"link" | "msg" | null>(null);
  const [native, setNative] = useState(false);
  useEffect(() => setNative(canNativeShare()), []);

  const url = absoluteUrl(`/produto/${slug}`, siteUrl);
  const message = buildShareMessage(shareMessage, name, url);
  const sellerMessage = `Temos esse modelo aqui 👇\n\n*${name}*\n${url}`;

  const done = (channel: string) => track({ type: "share", productId, meta: { channel } });

  const copy = async (kind: "link" | "msg") => {
    if (await copyText(kind === "link" ? url : sellerMessage)) {
      setCopied(kind);
      done(kind === "link" ? "copy_link" : "copy_message");
      setTimeout(() => setCopied(null), 1800);
    }
  };

  const row =
    "flex h-14 w-full items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 text-left text-sm font-semibold transition hover:border-line-strong";

  return (
    <Sheet open={open} onClose={onClose} title="Compartilhar produto">
      <p className="mb-4 line-clamp-2 text-sm text-muted">{name}</p>
      <div className="space-y-2">
        <a href={whatsappShareLink(message)} target="_blank" rel="noopener noreferrer" onClick={() => done("whatsapp")} className={row}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-whatsapp/15 text-whatsapp">
            <WhatsAppIcon className="h-5 w-5" />
          </span>
          Enviar pelo WhatsApp
        </a>
        <button type="button" onClick={() => copy("link")} className={row}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface-3 text-gold">
            {copied === "link" ? <Check className="h-5 w-5 text-success" /> : <Copy className="h-5 w-5" />}
          </span>
          {copied === "link" ? "Link copiado!" : "Copiar link"}
        </button>
        <button type="button" onClick={() => copy("msg")} className={row}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface-3 text-gold">
            {copied === "msg" ? <Check className="h-5 w-5 text-success" /> : <MessageSquareText className="h-5 w-5" />}
          </span>
          <span>
            {copied === "msg" ? "Mensagem copiada!" : "Copiar mensagem pronta"}
            <span className="block text-xs font-normal text-subtle">“Temos esse modelo aqui 👇” + link</span>
          </span>
        </button>
        {native && (
          <button
            type="button"
            onClick={async () => {
              if (await nativeShare({ title: name, text: shareMessage.replace("{produto}", name), url })) done("native");
            }}
            className={row}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface-3 text-gold">
              <Share2 className="h-5 w-5" />
            </span>
            Mais opções…
          </button>
        )}
      </div>
    </Sheet>
  );
}
