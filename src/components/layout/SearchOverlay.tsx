"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Clock, Loader2, Search, X } from "lucide-react";
import { useUI } from "@/store/ui-store";
import { formatBRL } from "@/lib/pricing";
import { track } from "@/lib/analytics";
import type { SearchHit } from "@/app/api/search/route";

const QUICK = ["iPhone", "Xiaomi", "PS5", "Fone", "Película", "Gamer", "Capa", "Camiseta"];
const RECENT_KEY = "oas-recent-searches";

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]").slice(0, 5);
  } catch {
    return [];
  }
}
function saveRecent(q: string) {
  try {
    const list = [q, ...readRecent().filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function SearchOverlay() {
  const { searchOpen, closeSearch } = useUI();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (!searchOpen) return;
    setRecent(readRecent());
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSearch();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [searchOpen, closeSearch]);

  // Busca instantânea com debounce e cancelamento da requisição anterior
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as { hits: SearchHit[]; total: number };
        setHits(data.hits);
        setTotal(data.total);
        setError(false);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError(true);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 140);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  if (!searchOpen || typeof document === "undefined") return null;

  const close = () => {
    closeSearch();
    setQ("");
  };

  const goToCatalog = (term: string) => {
    const t = term.trim();
    if (!t) return;
    saveRecent(t);
    track({ type: "search", query: t, meta: { results: total } });
    close();
    router.push(`/catalogo?q=${encodeURIComponent(t)}`);
  };

  const term = q.trim();

  return createPortal(
    <div className="fixed inset-0 z-[75]" role="dialog" aria-modal="true" aria-label="Pesquisar produtos">
      <div className="absolute inset-0 hidden animate-fade-in bg-black/70 md:block" onClick={close} />
      <div className="relative flex h-full flex-col bg-bg md:mx-auto md:mt-[8vh] md:h-auto md:max-h-[80vh] md:max-w-2xl md:animate-fade-up md:rounded-3xl md:border md:border-line md:bg-surface md:shadow-[var(--shadow-pop)]">
        <form
          className="flex items-center gap-2 border-b border-line px-3 py-3 md:px-4"
          onSubmit={(e) => {
            e.preventDefault();
            goToCatalog(q);
          }}
        >
          <button type="button" onClick={close} className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted hover:text-text md:hidden" aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              placeholder="O que você procura?"
              aria-label="Pesquisar produtos"
              className="h-12 w-full rounded-[var(--radius-control)] border border-line bg-surface-2 pl-11 pr-10 text-base outline-none transition placeholder:text-subtle focus:border-gold/60 [&::-webkit-search-cancel-button]:hidden"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-subtle hover:text-text" aria-label="Limpar busca">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button type="button" onClick={close} className="hidden h-11 px-3 text-sm text-muted hover:text-text md:block">
            Fechar
          </button>
        </form>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {term.length < 2 ? (
            <div className="space-y-6">
              {recent.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-subtle">Buscas recentes</h3>
                  <ul>
                    {recent.map((r) => (
                      <li key={r}>
                        <button type="button" onClick={() => setQ(r)} className="flex h-11 w-full items-center gap-3 text-left text-sm text-muted hover:text-text">
                          <Clock className="h-4 w-4 text-subtle" /> {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-subtle">Mais procurados</h3>
                <div className="flex flex-wrap gap-2">
                  {QUICK.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setQ(s)}
                      className="h-10 rounded-full border border-line bg-surface-2 px-4 text-sm font-medium transition hover:border-gold/60 hover:text-gold-bright"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-muted">Não foi possível buscar agora. Verifique sua conexão e tente novamente.</p>
          ) : hits.length === 0 && !loading ? (
            <div className="py-10 text-center">
              <p className="font-semibold">Nenhum produto para “{term}”</p>
              <p className="mt-1 text-sm text-muted">Tente outra palavra ou fale com a gente: talvez esteja chegando.</p>
            </div>
          ) : (
            <>
              <div className="mb-2 flex h-5 items-center justify-between text-xs text-subtle">
                <span>{loading ? "Buscando…" : `${total} ${total === 1 ? "resultado" : "resultados"}`}</span>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              <ul className="divide-y divide-line">
                {hits.map((h) => (
                  <li key={h.slug}>
                    <Link
                      href={`/produto/${h.slug}`}
                      onClick={() => {
                        saveRecent(term);
                        track({ type: "search", query: term, meta: { clicked: h.slug } });
                        close();
                      }}
                      className="flex items-center gap-3 py-2.5"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                        {h.image ? (
                          <Image src={h.image} alt="" fill sizes="56px" unoptimized={h.image.endsWith(".svg")} className="object-cover" />
                        ) : (
                          <span className="grid h-full place-items-center font-display text-gold/50">Ω</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{h.name}</p>
                        <p className="truncate text-xs text-subtle">{[h.brand, h.category].filter(Boolean).join(" · ")}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        {h.outOfStock ? (
                          <span className="text-xs font-semibold text-danger">Esgotado</span>
                        ) : (
                          <>
                            {h.fromPrice && <span className="block text-[10px] text-subtle">a partir de</span>}
                            <span className="tabular text-sm font-bold">{formatBRL(h.price)}</span>
                          </>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {total > 0 && (
                <button
                  type="button"
                  onClick={() => goToCatalog(q)}
                  className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-line text-sm font-semibold text-gold-bright hover:border-gold/60"
                >
                  Ver {total > hits.length ? `todos os ${total} resultados` : "no catálogo"} <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
