"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/** Liga o seletor de variação à galeria: escolher "Azul" mostra a foto azul */
const Ctx = createContext<{ activeImage?: string; setActiveImage: (url?: string) => void }>({ setActiveImage: () => {} });

export function ProductDetailProvider({ children }: { children: ReactNode }) {
  const [activeImage, setActiveImage] = useState<string>();
  return <Ctx.Provider value={{ activeImage, setActiveImage }}>{children}</Ctx.Provider>;
}

export const useProductDetail = () => useContext(Ctx);
