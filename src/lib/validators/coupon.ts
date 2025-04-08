import { CouponType } from "@prisma/client";
import { z } from "zod";

export const couponValidator = z.object({
  code: z.string(),
  name: z.string(),
  dateRange: z.object(
    {
      from: z.date().nullish(),
      to: z.date().nullish(),
    },
    { required_error: "At least select a potential start date." }
  ),

  discountType: z.nativeEnum(CouponType).default(CouponType.PERCENTAGE),

  discountAmount: z.coerce.number().nonnegative(),
  minimumSubtotal: z.coerce
    .number()
    .nonnegative()
    .min(1, { message: "Your minimum subtotal must be at least 1" })
    .optional()
    .nullish(),

  amountX: z.coerce
    .number()
    .positive({ message: "Your amount must be at least 1" })
    .optional(),
  amountY: z.coerce
    .number()
    .positive({ message: "Your amount must be at least 1" })
    .optional(),

  totalUses: z.coerce
    .number()
    .nonnegative()
    .min(1, { message: "Your total uses must be at least 1" })
    .optional()
    .nullish(),
  limitPerCustomer: z.coerce
    .number()
    .nonnegative()
    .min(1, { message: "Your total uses must be at least 1" })
    .optional()
    .nullish(),

  oncePerOrder: z.boolean().default(false),

  isActive: z.boolean().default(true),
  allProducts: z.boolean().default(false),

  product: z
    .array(z.object({ id: z.string() }))
    .max(1)
    .optional(),
  collection: z
    .array(z.object({ id: z.string() }))
    .max(1)
    .optional(),

  useWithSale: z.boolean().default(true),
  details: z.string().optional(),
});
