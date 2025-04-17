import type { Product, Variation } from "~/types/product";

export type PreviousProduct = {
  variantId: string;
  productId: string;
  product: Product | null;
  variant: Variation | null;
};
