import { z } from "zod";

import { CollectionStatus } from "@prisma/client";

export const collectionValidator = z.object({
  name: z.string().min(3, {
    message: "Name needs to be at least three characters long and unique.",
  }),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  isFeatured: z.boolean(),
  products: z.array(z.object({ id: z.string() })),
  status: z.nativeEnum(CollectionStatus),
});

export const updateCollectionSchema = collectionValidator.extend({
  collectionId: z.string(),
});

export const createCollectionSchema = collectionValidator.extend({
  storeId: z.string().optional(),
});

export const getCollectionSchema = z.object({
  storeId: z.string(),
  isFeatured: z.boolean().optional(),
});

export const collectionFormValidator = collectionValidator.extend({
  tempImageUrl: z.any().optional().nullable(),
});

export type CollectionFormData = z.infer<typeof collectionFormValidator>;
