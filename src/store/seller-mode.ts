"use client";

import { useSyncExternalStore } from "react";

/**
 * Modo vendedor: exibe atalhos de "copiar link" e "enviar no WhatsApp" direto
 * nos cards, para responder clientes em segundos. Ativado em /vendedor.
 */
const KEY = "oas-seller-mode";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setSellerMode(on: boolean) {
  try {
    if (on) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useSellerMode(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      window.addEventListener("storage", cb);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", cb);
      };
    },
    read,
    () => false,
  );
}
