"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, Save, Star, Trash2, Wand2, X } from "lucide-react";
import type { Brand, Category, Product } from "@/lib/types";
import { normalize } from "@/lib/search";
import { formatBRL } from "@/lib/pricing";
import { deleteProduct, saveProduct, type ProductPayload } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { ImageUploader, type EditableImage } from "./ImageUploader";
import { Card, Field, FormError, Select, TextArea, TextInput, Toggle, inputCls, slugify } from "./fields";
import { cn } from "@/lib/cn";

interface VariantRow {
  options: Record<string, string>;
  sku: string;
  price: string;
  promo: string;
  stock: string;
  image: string;
}
interface GroupRow {
  name: string;
  values: string;
}

const num = (s: string) => (s.trim() === "" ? null : Number(s.replace(",", ".")));
const keyOf = (o: Record<string, string>, groups: string[]) => groups.map((g) => o[g] ?? "").join("|");

export function ProductForm({
  product,
  categories,
  brands,
  allProducts,
}: {
  product?: Product;
  categories: Category[];
  brands: Brand[];
  allProducts: Product[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [sku, setSku] = useState(product?.sku ?? "");
  const [brandId, setBrandId] = useState(product?.brandId ?? "");
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [promo, setPromo] = useState(product?.promoPrice != null ? String(product.promoPrice) : "");
  const [instCount, setInstCount] = useState(product?.installments ? String(product.installments.count) : "");
  const [instFree, setInstFree] = useState(product?.installments?.interestFree ?? true);
  const [stock, setStock] = useState(product ? String(product.stock) : "0");
  const [categoryIds, setCategoryIds] = useState<string[]>(product?.categoryIds ?? []);
  const [images, setImages] = useState<EditableImage[]>(product?.images ?? []);
  const [specs, setSpecs] = useState(product?.specs.length ? product.specs : [{ label: "", value: "" }]);
  const [tags, setTags] = useState(product?.tags.join(", ") ?? "");
  const [isFeatured, setFeatured] = useState(product?.isFeatured ?? false);
  const [isNew, setNew] = useState(product?.isNew ?? true);
  const [active, setActive] = useState(product?.active ?? true);
  const [groups, setGroups] = useState<GroupRow[]>(product?.optionGroups.map((g) => ({ name: g.name, values: g.values.join(", ") })) ?? []);
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants.map((v) => ({
      options: v.options,
      sku: v.sku ?? "",
      price: v.price != null ? String(v.price) : "",
      promo: v.promoPrice != null ? String(v.promoPrice) : "",
      stock: String(v.stock),
      image: v.image ?? "",
    })) ?? [],
  );
  const [kitIds, setKitIds] = useState<string[]>(product?.kitProductIds ?? []);
  const [kitQuery, setKitQuery] = useState("");

  const parsedGroups = useMemo(
    () =>
      groups
        .map((g) => ({ name: g.name.trim(), values: g.values.split(",").map((v) => v.trim()).filter(Boolean) }))
        .filter((g) => g.name && g.values.length),
    [groups],
  );

  /** Gera todas as combinações, preservando preço/estoque das que já existiam */
  const generateVariants = () => {
    const names = parsedGroups.map((g) => g.name);
    const combos = parsedGroups.reduce<Record<string, string>[]>((acc, g) => acc.flatMap((a) => g.values.map((v) => ({ ...a, [g.name]: v }))), [{}]);
    const existing = new Map(variants.map((v) => [keyOf(v.options, names), v]));
    setVariants(
      parsedGroups.length
        ? combos.map((o) => existing.get(keyOf(o, names)) ?? { options: o, sku: "", price: "", promo: "", stock: "0", image: "" })
        : [],
    );
  };

  const updateVariant = (i: number, patch: Partial<VariantRow>) => setVariants((vs) => vs.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  const groupsOutOfSync =
    parsedGroups.length > 0 &&
    (variants.length === 0 || variants.some((v) => parsedGroups.some((g) => !g.values.includes(v.options[g.name] ?? ""))));

  const kitCandidates = useMemo(() => {
    const q = normalize(kitQuery);
    return allProducts.filter((p) => p.id !== product?.id && !kitIds.includes(p.id) && (!q || normalize(p.name).includes(q))).slice(0, 6);
  }, [allProducts, kitQuery, kitIds, product?.id]);
  const byId = useMemo(() => new Map(allProducts.map((p) => [p.id, p])), [allProducts]);

  const submit = () => {
    setError(null);
    setSaved(false);
    if (groupsOutOfSync) {
      setError("As variações não batem com as opções. Clique em “Gerar combinações” antes de salvar.");
      return;
    }
    const payload: ProductPayload = {
      id: product?.id,
      name: name.trim(),
      slug: slug || slugify(name),
      sku: sku.trim() || undefined,
      brand_id: brandId || undefined,
      short_description: shortDescription.trim() || undefined,
      description: description.trim() || undefined,
      price: num(price) ?? NaN,
      promo_price: num(promo),
      installments_count: num(instCount),
      installments_interest_free: instFree,
      stock: num(stock) ?? 0,
      specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      option_groups: parsedGroups,
      tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
      is_featured: isFeatured,
      is_new: isNew,
      active,
      category_ids: categoryIds,
      images,
      variants: variants.map((v) => ({
        options: v.options,
        sku: v.sku.trim() || undefined,
        price: num(v.price),
        promo_price: num(v.promo),
        stock: num(v.stock) ?? 0,
        image_url: v.image || undefined,
      })),
      kit_ids: kitIds,
    };
    start(async () => {
      const r = await saveProduct(payload);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setSaved(true);
      if (!product && r.id) router.replace(`/admin/produtos/${r.id}`);
      else router.refresh();
    });
  };

  return (
    <form
      className="space-y-4 pb-28"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Card title="Informações básicas">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome do produto *" className="sm:col-span-2">
            <TextInput
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="Ex.: iPhone 15"
            />
          </Field>
          <Field label="Endereço (slug)" hint={`Link: /produto/${slug || "…"}`}>
            <TextInput
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
            />
          </Field>
          <Field label="SKU / código interno">
            <TextInput value={sku} onChange={(e) => setSku(e.target.value)} />
          </Field>
          <Field label="Marca">
            <Select value={brandId} onChange={(e) => setBrandId(e.target.value)}>
              <option value="">Sem marca</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Etiquetas de busca" hint="Separadas por vírgula. Ex.: celular, 5g, setup-gamer (coleções usam etiquetas)">
            <TextInput value={tags} onChange={(e) => setTags(e.target.value)} />
          </Field>
          <Field label="Descrição curta" hint="Aparece no topo da página e na prévia do link" className="sm:col-span-2">
            <TextInput value={shortDescription} maxLength={160} onChange={(e) => setShortDescription(e.target.value)} />
          </Field>
          <Field label="Descrição completa" hint="Deixe uma linha em branco para separar parágrafos" className="sm:col-span-2">
            <TextArea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card title="Preço e estoque" description="Variações podem ter preço próprio; em branco usam o preço do produto.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Preço (R$) *">
            <TextInput required inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" />
          </Field>
          <Field label="Preço promocional (R$)" hint={num(promo) && num(price) ? `Desconto de ${Math.round((1 - num(promo)! / num(price)!) * 100)}%` : "Deixe vazio sem promoção"}>
            <TextInput inputMode="decimal" value={promo} onChange={(e) => setPromo(e.target.value)} />
          </Field>
          <Field label="Estoque" hint={variants.length ? "Calculado pela soma das variações" : undefined}>
            <TextInput inputMode="numeric" value={variants.length ? String(variants.reduce((s, v) => s + (num(v.stock) ?? 0), 0)) : stock} disabled={variants.length > 0} onChange={(e) => setStock(e.target.value)} />
          </Field>
          <Field label="Parcelas (opcional)" hint="Ex.: 12">
            <TextInput inputMode="numeric" value={instCount} onChange={(e) => setInstCount(e.target.value)} />
          </Field>
          <div className="flex items-end sm:col-span-2">
            <Toggle checked={instFree} onChange={setInstFree} label="Parcelamento sem juros" />
          </div>
        </div>
      </Card>

      <Card title="Categorias *" description="A primeira marcada (★) é a principal: aparece no card e no caminho da página.">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const idx = categoryIds.indexOf(c.id);
            const on = idx >= 0;
            return (
              <div key={c.id} className="flex">
                <button
                  type="button"
                  onClick={() => setCategoryIds((ids) => (on ? ids.filter((x) => x !== c.id) : [...ids, c.id]))}
                  className={cn("h-10 rounded-l-full border px-4 text-sm font-semibold transition", on ? "border-gold bg-gold/12 text-gold-bright" : "rounded-r-full border-line text-muted")}
                >
                  {c.name}
                  {!c.active && " (oculta)"}
                </button>
                {on && (
                  <button
                    type="button"
                    title="Tornar principal"
                    onClick={() => setCategoryIds((ids) => [c.id, ...ids.filter((x) => x !== c.id)])}
                    className={cn("grid h-10 w-10 place-items-center rounded-r-full border border-l-0 border-gold", idx === 0 ? "bg-gold text-gold-ink" : "text-gold")}
                    aria-label={`Tornar ${c.name} a categoria principal`}
                  >
                    <Star className="h-4 w-4" fill={idx === 0 ? "currentColor" : "none"} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Fotos">
        <ImageUploader images={images} onChange={setImages} />
      </Card>

      <Card
        title="Variações"
        description="Ex.: Armazenamento = 128 GB, 256 GB · Cor = Preto, Azul. Depois gere as combinações e ajuste preço e estoque de cada uma."
        actions={
          <Button variant="secondary" size="sm" onClick={() => setGroups((g) => [...g, { name: "", values: "" }])}>
            <Plus className="h-4 w-4" /> Opção
          </Button>
        }
      >
        {groups.length === 0 ? (
          <p className="text-sm text-subtle">Produto sem variações.</p>
        ) : (
          <div className="space-y-2">
            {groups.map((g, i) => (
              <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                <TextInput placeholder="Nome (ex.: Cor)" value={g.name} onChange={(e) => setGroups((gs) => gs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                <TextInput placeholder="Valores separados por vírgula" value={g.values} onChange={(e) => setGroups((gs) => gs.map((x, j) => (j === i ? { ...x, values: e.target.value } : x)))} />
                <button type="button" onClick={() => setGroups((gs) => gs.filter((_, j) => j !== i))} className="grid h-11 w-11 place-items-center rounded-xl text-muted hover:text-danger" aria-label="Remover opção">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button variant={groupsOutOfSync ? "primary" : "secondary"} size="sm" onClick={generateVariants} className="mt-2">
              <Wand2 className="h-4 w-4" /> Gerar combinações
            </Button>
          </div>
        )}

        {variants.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs text-subtle">
                  <th className="pb-2 font-semibold">Variação</th>
                  <th className="pb-2 font-semibold">SKU</th>
                  <th className="pb-2 font-semibold">Preço</th>
                  <th className="pb-2 font-semibold">Promo</th>
                  <th className="pb-2 font-semibold">Estoque</th>
                  <th className="pb-2 font-semibold">Foto</th>
                </tr>
              </thead>
              <tbody className="align-middle">
                {variants.map((v, i) => (
                  <tr key={Object.values(v.options).join("|")} className="border-t border-line">
                    <td className="py-2 pr-2 font-medium">{Object.values(v.options).join(" · ")}</td>
                    <td className="py-2 pr-2">
                      <input className={cn(inputCls, "h-9 w-28")} value={v.sku} onChange={(e) => updateVariant(i, { sku: e.target.value })} />
                    </td>
                    <td className="py-2 pr-2">
                      <input className={cn(inputCls, "h-9 w-24")} inputMode="decimal" placeholder={price || "—"} value={v.price} onChange={(e) => updateVariant(i, { price: e.target.value })} />
                    </td>
                    <td className="py-2 pr-2">
                      <input className={cn(inputCls, "h-9 w-24")} inputMode="decimal" value={v.promo} onChange={(e) => updateVariant(i, { promo: e.target.value })} />
                    </td>
                    <td className="py-2 pr-2">
                      <input className={cn(inputCls, "h-9 w-20")} inputMode="numeric" value={v.stock} onChange={(e) => updateVariant(i, { stock: e.target.value })} />
                    </td>
                    <td className="py-2">
                      <select className={cn(inputCls, "h-9 w-28")} value={v.image} onChange={(e) => updateVariant(i, { image: e.target.value })}>
                        <option value="">Padrão</option>
                        {images.map((img, j) => (
                          <option key={img.url} value={img.url}>
                            Foto {j + 1}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card
        title="Especificações"
        actions={
          <Button variant="secondary" size="sm" onClick={() => setSpecs((s) => [...s, { label: "", value: "" }])}>
            <Plus className="h-4 w-4" /> Linha
          </Button>
        }
      >
        <div className="space-y-2">
          {specs.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
              <TextInput placeholder="Ex.: Tela" value={s.label} onChange={(e) => setSpecs((ss) => ss.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
              <TextInput placeholder={'Ex.: 6,1" OLED'} value={s.value} onChange={(e) => setSpecs((ss) => ss.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
              <button type="button" onClick={() => setSpecs((ss) => ss.filter((_, j) => j !== i))} className="grid h-11 w-11 place-items-center rounded-xl text-muted hover:text-danger" aria-label="Remover linha">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Monte seu kit" description="Produtos sugeridos junto com este (ex.: capa, película e carregador para um celular).">
        {kitIds.length > 0 && (
          <ul className="mb-3 space-y-1.5">
            {kitIds.map((id) => (
              <li key={id} className="flex items-center justify-between gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm">
                <span className="truncate">{byId.get(id)?.name ?? "Produto removido"}</span>
                <button type="button" onClick={() => setKitIds((k) => k.filter((x) => x !== id))} className="text-muted hover:text-danger" aria-label="Remover do kit">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <TextInput placeholder="Buscar produto para adicionar ao kit" value={kitQuery} onChange={(e) => setKitQuery(e.target.value)} />
        {kitQuery && (
          <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
            {kitCandidates.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    setKitIds((k) => [...k, p.id].slice(0, 8));
                    setKitQuery("");
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm hover:bg-surface-2"
                >
                  <span className="truncate">{p.name}</span>
                  <span className="tabular shrink-0 text-xs text-subtle">{formatBRL(p.promoPrice ?? p.price)}</span>
                </button>
              </li>
            ))}
            {kitCandidates.length === 0 && <li className="px-3 py-2.5 text-sm text-subtle">Nenhum produto.</li>}
          </ul>
        )}
      </Card>

      <Card title="Exibição">
        <div className="flex flex-wrap gap-x-8">
          <Toggle checked={active} onChange={setActive} label="Visível no catálogo" />
          <Toggle checked={isFeatured} onChange={setFeatured} label="Destaque na Home" />
          <Toggle checked={isNew} onChange={setNew} label="Selo “Novo”" />
        </div>
      </Card>

      {/* Barra de salvar fixa */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur lg:left-[240px]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <FormError message={error} />
            {saved && !error && <p className="text-sm text-success">Salvo! O catálogo já foi atualizado.</p>}
          </div>
          {product && (
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" /> Excluir
            </Button>
          )}
          <Link href="/admin/produtos" className="h-11 px-3 text-sm leading-[44px] text-muted hover:text-text">
            Cancelar
          </Link>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar produto
          </Button>
        </div>
      </div>

      {product && (
        <Sheet
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          title="Excluir produto?"
          footer={
            <div className="flex gap-3">
              <Button variant="secondary" block onClick={() => setConfirmDelete(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                block
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const r = await deleteProduct(product.id);
                    if (!r.ok) {
                      setError(r.error);
                      setConfirmDelete(false);
                      return;
                    }
                    router.replace("/admin/produtos");
                  })
                }
              >
                Excluir definitivamente
              </Button>
            </div>
          }
        >
          <p className="text-sm text-muted">
            “{product.name}” será removido do catálogo junto com suas variações e sugestões de kit. Para apenas esconder, desligue “Visível no
            catálogo”.
          </p>
        </Sheet>
      )}
    </form>
  );
}
