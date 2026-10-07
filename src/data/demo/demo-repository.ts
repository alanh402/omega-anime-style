import type { CatalogRepository } from "../repository";
import { demoBrands, demoCategories } from "./categories";
import { demoProducts } from "./products";

/** Repositório de demonstração: lê os arquivos desta pasta. */
export const demoRepository: CatalogRepository = {
  source: "demo",
  async getSettings() {
    return {};
  },
  async listCategories() {
    return demoCategories.filter((c) => c.active).sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async listBrands() {
    return demoBrands.filter((b) => b.active);
  },
  async listProducts() {
    return demoProducts.filter((p) => p.active);
  },
};
