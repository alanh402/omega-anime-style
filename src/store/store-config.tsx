"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StoreSettings } from "@/lib/types";

/**
 * Configurações públicas da loja disponíveis nos componentes de cliente
 * (WhatsApp, mensagens, nome). Vêm do servidor — nada fixo no frontend.
 */
export type PublicStoreConfig = Pick<
  StoreSettings,
  "storeName" | "whatsappNumber" | "orderMessage" | "shareMessage" | "instagram"
> & { siteUrl: string };

const StoreConfigContext = createContext<PublicStoreConfig | null>(null);

export function StoreConfigProvider({ value, children }: { value: PublicStoreConfig; children: ReactNode }) {
  return <StoreConfigContext.Provider value={value}>{children}</StoreConfigContext.Provider>;
}

export function useStoreConfig(): PublicStoreConfig {
  const ctx = useContext(StoreConfigContext);
  if (!ctx) throw new Error("useStoreConfig deve ser usado dentro de <StoreConfigProvider>");
  return ctx;
}
