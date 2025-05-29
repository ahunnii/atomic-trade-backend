import type { Variation } from "@prisma/client";

import type { ProductWithVariations } from "~/types/product";

export type PreviousProduct = {
  variantId: string;
  productId: string;
  product: ProductWithVariations | null;
  variant: Variation | null;
};
