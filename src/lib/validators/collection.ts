import { z } from "zod";

export const collectionValidator = z.object({
  name: z.string().min(3, {
    message: "Name needs to be at least three characters long and unique.",
  }),
  imageUrl: z.string().min(1),
  description: z.string().optional(),
  isFeatured: z.boolean().default(false),
  slug: z.string().optional(),
  products: z.array(z.object({ id: z.string() })),
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
