import { z } from "zod";

export const reviewValidator = z.object({
  productId: z.string(),
  userId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string(),
  content: z.string(),
  images: z.array(z.string()),
});
