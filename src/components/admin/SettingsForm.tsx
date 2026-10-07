"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Save, X } from "lucide-react";
import type { Collection, StoreSettings } from "@/lib/types";
import { saveSettings } from "@/app/admin/actions";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";
import { Card, Field, FormError, TextArea, TextInput, slugify } from "./fields";

export function SettingsForm({ initial }: { initial: StoreSettings }) {
  const [s, setS] = useState<StoreSettings>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const set = <K extends keyof StoreSettings>(k: K, v: StoreSettings[K]) => {
    setSaved(false);
    setS((x) => ({ ...x, [k]: v }));
  };
  const setCollection = (i: number, patch: Partial<Collection>) => set("collections", s.collections.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  const sample = buildOrderMessage({
    items: [{ key: "x", productId: "x", slug: "iphone-15", name: "iPhone 15", variantLabel: "128 GB · Preto", unitPrice: 4699, quantity: 1, maxQuantity: 1 }],
    settings: s,
    siteUrl: "https://seusite.com.br",
  });

  return (
    <form
      className="space-y-4 pb-24"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await saveSettings(s);
          setError(r.ok ? null : r.error);
          setSaved(r.ok);
        });
      }}
    >
      <Card title="Loja e contato">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome da loja">
            <TextInput value={s.storeName} onChange={(e) => set("storeName", e.target.value)} />
          </Field>
          <Field label="Frase da marca">
            <TextInput value={s.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="WhatsApp de atendimento" hint="Com DDI e DDD, só números. Ex.: 5599985531987">
            <TextInput inputMode="tel" value={s.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value.replace(/[^\d]/g, ""))} />
          </Field>
          <div className="flex items-end">
            <a href={whatsappLink(s.whatsappNumber, "Teste do catálogo Omega")} target="_blank" rel="noopener noreferrer" className="h-11 text-sm font-semibold leading-[44px] text-whatsapp">
              Testar este número →
            </a>
          </div>
          <Field label="Instagram (sem @)">
            <TextInput value={s.instagram ?? ""} onChange={(e) => set("instagram", e.target.value.replace("@", "") || undefined)} />
          </Field>
          <Field label="Horário de atendimento">
            <TextInput value={s.openingHours ?? ""} placeholder="Seg a Sáb, 9h às 19h" onChange={(e) => set("openingHours", e.target.value || undefined)} />
          </Field>
          <Field label="Endereço" className="sm:col-span-2">
            <TextInput value={s.address ?? ""} onChange={(e) => set("address", e.target.value || undefined)} />
          </Field>
        </div>
      </Card>

      <Card title="Textos da Home" description="Use uma quebra de linha no título para destacar a segunda parte em dourado.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Linha acima do título" className="sm:col-span-2">
            <TextInput value={s.hero.eyebrow} onChange={(e) => set("hero", { ...s.hero, eyebrow: e.target.value })} />
          </Field>
          <Field label="Título" className="sm:col-span-2">
            <TextArea rows={2} value={s.hero.title} onChange={(e) => set("hero", { ...s.hero, title: e.target.value })} />
          </Field>
          <Field label="Subtítulo" className="sm:col-span-2">
            <TextArea rows={3} value={s.hero.subtitle} onChange={(e) => set("hero", { ...s.hero, subtitle: e.target.value })} />
          </Field>
          <Field label="Botão principal">
            <TextInput value={s.hero.primaryCta} onChange={(e) => set("hero", { ...s.hero, primaryCta: e.target.value })} />
          </Field>
          <Field label="Botão do WhatsApp">
            <TextInput value={s.hero.secondaryCta} onChange={(e) => set("hero", { ...s.hero, secondaryCta: e.target.value })} />
          </Field>
        </div>
      </Card>

      <Card title="Mensagens do WhatsApp" description="{loja} é trocado pelo nome da loja.">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Abertura do pedido">
              <TextArea rows={2} value={s.orderMessage.greeting} onChange={(e) => set("orderMessage", { ...s.orderMessage, greeting: e.target.value })} />
            </Field>
            <Field label="Fechamento do pedido">
              <TextArea rows={2} value={s.orderMessage.closing} onChange={(e) => set("orderMessage", { ...s.orderMessage, closing: e.target.value })} />
            </Field>
            <Field label="Mensagem ao compartilhar produto">
              <TextInput value={s.shareMessage} onChange={(e) => set("shareMessage", e.target.value)} />
            </Field>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-muted">Prévia</p>
            <pre className="whitespace-pre-wrap rounded-2xl bg-surface-2 p-4 font-sans text-xs leading-relaxed text-muted">{sample}</pre>
          </div>
        </div>
      </Card>

      <Card
        title="Coleções / banners da Home"
        description="Cada coleção reúne os produtos com a etiqueta indicada. O link é opcional (ex.: /categoria/apple)."
        actions={
          <Button variant="secondary" size="sm" onClick={() => set("collections", [...s.collections, { slug: "", title: "", subtitle: "", tag: "" }])}>
            <Plus className="h-4 w-4" /> Coleção
          </Button>
        }
      >
        <div className="space-y-3">
          {s.collections.map((c, i) => (
            <div key={i} className="grid gap-2 rounded-2xl border border-line p-3 sm:grid-cols-2">
              <TextInput placeholder="Título" value={c.title} onChange={(e) => setCollection(i, { title: e.target.value, slug: c.slug || slugify(e.target.value) })} />
              <TextInput placeholder="Subtítulo" value={c.subtitle} onChange={(e) => setCollection(i, { subtitle: e.target.value })} />
              <TextInput placeholder="Etiqueta dos produtos (ex.: setup-gamer)" value={c.tag} onChange={(e) => setCollection(i, { tag: e.target.value.toLowerCase() })} />
              <TextInput placeholder="Link opcional (ex.: /categoria/apple)" value={c.href ?? ""} onChange={(e) => setCollection(i, { href: e.target.value || undefined })} />
              <TextInput placeholder="URL da imagem do banner" value={c.image ?? ""} onChange={(e) => setCollection(i, { image: e.target.value || undefined })} className="sm:col-span-2" />
              <div className="flex items-center justify-between sm:col-span-2">
                <span className="text-xs text-subtle">{c.href || `/colecao/${c.slug || "…"}`}</span>
                <button type="button" onClick={() => set("collections", s.collections.filter((_, j) => j !== i))} className="flex h-9 items-center gap-1 text-xs text-muted hover:text-danger">
                  <X className="h-4 w-4" /> Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur lg:left-[240px]">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <FormError message={error} />
            {saved && <p className="text-sm text-success">Configurações salvas.</p>}
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar
          </Button>
        </div>
      </div>
    </form>
  );
}
