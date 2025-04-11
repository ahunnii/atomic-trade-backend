import type { CollectionStatus } from "@prisma/client";

import type { Product } from "./product";

export type Collection = {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  slug: string;
  imageUrl: string;
  isFeatured: boolean;
  products: Product[];
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  status: CollectionStatus;
};
