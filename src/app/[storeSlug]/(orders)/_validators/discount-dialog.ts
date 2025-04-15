import { z } from "zod";

export const discountFormSchema = z.object({
  discountType: z.string().optional(),
  discountValue: z.number().min(0),
  reason: z.string().optional(),
});

export type DiscountFormData = z.infer<typeof discountFormSchema>;
