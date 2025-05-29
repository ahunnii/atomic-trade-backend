import type { Attribute, Collection, Product, Variation } from "@prisma/client";

export type ProductWithVariations = Product & {
  variants: Variation[];
  attributes?: Attribute[];
  collections?: Collection[];
  _count: {
    variants: number | null;
  };
};

export type PartialProduct = Omit<Product, "collections"> & {
  variants: Variation[] | null;
  collections: Partial<Collection>[] | null;
};

export type SelectedProduct = Variation & {
  product: Product;
  variations: Variation[];
};
