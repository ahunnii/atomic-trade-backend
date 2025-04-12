import { z } from "zod";

export const discountFormSchema = z.object({
  discountType: z.enum(["amount", "percentage"]),
  discountValue: z.number().min(0),
  reason: z.string().optional(),
});

export type DiscountFormData = z.infer<typeof discountFormSchema>;
