/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  InventoryPolicy,
  ProductStatus,
  ProductType,
} from "@prisma/client";
import type { JsonValue } from "@prisma/client/runtime/library";

import type { Attribute } from "./attribute";
import type { Collection } from "./collection";

export type Variation = {
  id: string;
  productId: string;
  name: string;
  values: string[];
  stock: number;
  priceInCents: number;
  compareAtPriceInCents: number | null;
  manageStock: boolean;
  sku: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type Product = {
  id: string;
  status: ProductStatus;
  type: ProductType;
  slug: string | null;
  storeId: string;
  name: string;
  description: string;
  additionalInfo?: Record<string, any> | JsonValue | null;
  attributes: Array<Attribute>; // Assuming Attribute type would be defined elsewhere
  isFeatured: boolean;
  featuredImage: string;
  images: Array<string>; // Assuming Image has these properties
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  variants: Variation[];
  collections: Collection[];
};

export type PartialProduct = Omit<Product, "collections"> & {
  variants: Variation[] | null;
  collections: Partial<Collection>[] | null;
};

export type SelectedProduct = Variation & {
  product: Product;
  variations: Variation[];
};
