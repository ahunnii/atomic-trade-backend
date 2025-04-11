import type {
  InventoryPolicy,
  ProductStatus,
  ProductType,
} from "@prisma/client";

import type { Attribute } from "./attribute";
import type { Collection } from "./collection";

export type Variation = {
  id: string;
  productId: string;
  name: string;
  values: string[];
  stock: number;
  priceInCents: number;
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
  additionalInfo?: Record<string, unknown>;
  attributes: Array<Attribute>; // Assuming Attribute type would be defined elsewhere
  isFeatured: boolean;
  featuredImage: string;
  images: Array<string>; // Assuming Image has these properties
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  variants: Array<Variation>;
  collections: Array<Collection>; // Assuming Collection type would be defined elsewhere
};
