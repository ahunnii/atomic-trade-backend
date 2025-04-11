import type {
  InventoryPolicy,
  ProductStatus,
  ProductType,
} from "@prisma/client";

import type { Attribute } from "./attribute";

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
  variants: Array<{
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
  }>;
  collections: Array<unknown>; // Assuming Collection type would be defined elsewhere
};
