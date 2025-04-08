import { z } from "zod";

export const cartItemValidator = z.object({
  image: z.string(),
  id: z.string(),
  price: z.number(),
  salesPrice: z.number().optional().nullable(),
  sale: z.string().optional().nullable(),
  quantity: z.number(),
  name: z.string(),
  variant: z.string(),
  variantId: z.string(),
  maxQuantity: z.number(),
  productId: z.string(),
  saleId: z.string().optional().nullable(),
});
