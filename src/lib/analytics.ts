"use client";

import type { AnalyticsEvent } from "./types";

/**
 * Rastreamento leve de interesse (visualizações, cliques no WhatsApp, etc.).
 * Envia via sendBeacon para /api/events, que grava no Supabase quando configurado.
 * Nunca bloqueia a interface nem quebra a navegação se falhar.
 */

const SESSION_KEY = "oas-session";

function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({ ...event, sessionId: sessionId() });
    const ok = navigator.sendBeacon?.("/api/events", new Blob([body], { type: "application/json" }));
    if (!ok) {
      void fetch("/api/events", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
    }
  } catch {
    /* analytics nunca deve interromper o cliente */
  }
}

export function getSessionId(): string {
  return sessionId();
}
