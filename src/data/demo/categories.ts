/**
 * DADOS DE DEMONSTRAÇÃO — substitua pelo cadastro real (Supabase/admin).
 */
import type { Brand, Category } from "@/lib/types";

const c = (sortOrder: number, slug: string, name: string, icon: string, description: string): Category => ({
  id: `cat-${slug}`,
  slug,
  name,
  icon,
  description,
  sortOrder,
  active: true,
});

export const demoCategories: Category[] = [
  c(1, "smartphones", "Smartphones", "smartphone", "Os lançamentos e os campeões de custo-benefício."),
  c(2, "iphone", "iPhone", "smartphone", "Linha iPhone com garantia e procedência."),
  c(3, "apple", "Apple", "apple", "iPhone, iPad, AirPods e acessórios do ecossistema Apple."),
  c(4, "xiaomi", "Xiaomi", "smartphone", "Redmi, POCO e Xiaomi: desempenho com preço justo."),
  c(5, "ipad", "iPad", "tablet", "Para estudar, criar e jogar."),
  c(6, "games", "Games", "gamepad-2", "Consoles, controles, jogos e acessórios."),
  c(7, "ps5", "PS5", "gamepad", "Tudo para o seu PlayStation 5."),
  c(8, "computadores-gamer", "Computadores Gamer", "monitor", "Notebooks e PCs prontos para rodar tudo."),
  c(9, "acessorios", "Acessórios", "cable", "Carregadores, cabos, mouses, teclados e mais."),
  c(10, "audio", "Áudio", "headphones", "Fones, headsets e caixas de som."),
  c(11, "capas", "Capas", "shield", "Proteção com estilo para o seu aparelho."),
  c(12, "peliculas", "Películas", "scan", "Películas 3D, privacidade e cerâmica."),
  c(13, "roupas", "Roupas", "shirt", "Camisetas e moletons com estética anime e street."),
  c(14, "variedades", "Variedades", "sparkles", "Smartwatches, iluminação e achados."),
];

const b = (slug: string, name: string): Brand => ({ id: `brand-${slug}`, slug, name, active: true });

export const demoBrands: Brand[] = [
  b("apple", "Apple"),
  b("xiaomi", "Xiaomi"),
  b("sony", "Sony"),
  b("nintendo", "Nintendo"),
  b("jbl", "JBL"),
  b("acer", "Acer"),
  b("redragon", "Redragon"),
  b("baseus", "Baseus"),
  b("omega", "Omega Anime Style"),
];
