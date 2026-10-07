"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface UIState {
  searchOpen: boolean;
  categoriesOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  openCategories: () => void;
  closeCategories: () => void;
}

const UIContext = createContext<UIState | null>(null);

/** Estado de overlays globais (busca e categorias), acionados pelo header e pela barra inferior */
export function UIProvider({ children }: { children: ReactNode }) {
  const [searchOpen, setSearch] = useState(false);
  const [categoriesOpen, setCategories] = useState(false);
  const value = useMemo(
    () => ({
      searchOpen,
      categoriesOpen,
      openSearch: () => {
        setCategories(false);
        setSearch(true);
      },
      closeSearch: () => setSearch(false),
      openCategories: () => {
        setSearch(false);
        setCategories(true);
      },
      closeCategories: () => setCategories(false),
    }),
    [searchOpen, categoriesOpen],
  );
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIState {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI deve ser usado dentro de <UIProvider>");
  return ctx;
}
