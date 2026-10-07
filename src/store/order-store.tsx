"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import type { CartItem } from "@/lib/types";
import { track } from "@/lib/analytics";

/**
 * "Seu pedido" — lista de produtos que o cliente envia ao WhatsApp.
 * Persistida no navegador para sobreviver a recarregamentos e voltas do WhatsApp.
 */

const STORAGE_KEY = "oas-order-v1";
const MAX_LINE_QTY = 20;

type State = { items: CartItem[]; hydrated: boolean };
type Action =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; item: Omit<CartItem, "quantity">; quantity: number }
  | { type: "setQty"; key: string; quantity: number }
  | { type: "remove"; key: string }
  | { type: "clear" };

const clampQty = (q: number, max: number) => Math.max(1, Math.min(q, Math.max(1, Math.min(max, MAX_LINE_QTY))));

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { items: action.items, hydrated: true };
    case "add": {
      const existing = state.items.find((i) => i.key === action.item.key);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.key === action.item.key
              ? { ...i, ...action.item, quantity: clampQty(i.quantity + action.quantity, action.item.maxQuantity) }
              : i,
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, quantity: clampQty(action.quantity, action.item.maxQuantity) }],
      };
    }
    case "setQty":
      return {
        ...state,
        items: state.items.map((i) => (i.key === action.key ? { ...i, quantity: clampQty(action.quantity, i.maxQuantity) } : i)),
      };
    case "remove":
      return { ...state, items: state.items.filter((i) => i.key !== action.key) };
    case "clear":
      return { ...state, items: [] };
  }
}

export interface Toast {
  id: number;
  title: string;
  description?: string;
  image?: string;
  action?: { label: string; href: string };
}

interface OrderContextValue {
  items: CartItem[];
  hydrated: boolean;
  count: number;
  total: number;
  /** Muda a cada adição — usado para micro-animação do ícone do pedido */
  bump: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number, opts?: { silent?: boolean }) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  toasts: Toast[];
  notify: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

export function cartKey(productId: string, variantId?: string) {
  return variantId ? `${productId}::${variantId}` : productId;
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], hydrated: false });
  const [bump, setBump] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
      dispatch({ type: "hydrate", items: Array.isArray(parsed) ? parsed.filter((i) => i && i.key && i.quantity > 0) : [] });
    } catch {
      dispatch({ type: "hydrate", items: [] });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      /* modo privado / armazenamento cheio: o pedido continua em memória */
    }
  }, [state.items, state.hydrated]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const notify = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = ++toastId.current;
      setToasts((list) => [...list.slice(-1), { ...t, id }]);
      window.setTimeout(() => dismiss(id), 3200);
    },
    [dismiss],
  );

  const add = useCallback<OrderContextValue["add"]>(
    (item, quantity = 1, opts) => {
      dispatch({ type: "add", item, quantity });
      setBump((b) => b + 1);
      track({ type: "add_to_order", productId: item.productId, meta: { variant: item.variantLabel, quantity } });
      if (!opts?.silent) {
        notify({
          title: "Adicionado ao pedido",
          description: item.variantLabel ? `${item.name} · ${item.variantLabel}` : item.name,
          image: item.image,
          action: { label: "Ver pedido", href: "/pedido" },
        });
      }
    },
    [notify],
  );

  const remove = useCallback(
    (key: string) => {
      const item = state.items.find((i) => i.key === key);
      if (item) track({ type: "remove_from_order", productId: item.productId });
      dispatch({ type: "remove", key });
    },
    [state.items],
  );

  const value = useMemo<OrderContextValue>(
    () => ({
      items: state.items,
      hydrated: state.hydrated,
      count: state.items.reduce((s, i) => s + i.quantity, 0),
      total: state.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
      bump,
      add,
      setQuantity: (key, quantity) => dispatch({ type: "setQty", key, quantity }),
      remove,
      clear: () => dispatch({ type: "clear" }),
      toasts,
      notify,
      dismiss,
    }),
    [state, bump, add, remove, toasts, notify, dismiss],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder deve ser usado dentro de <OrderProvider>");
  return ctx;
}
