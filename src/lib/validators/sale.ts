import { SaleDiscount } from "@prisma/client";

import { z } from "zod";
import { SaleType } from "~/types/sale";

export const saleValidator = z.object({
  name: z.string(),
  type: z.nativeEnum(SaleDiscount).default(SaleDiscount.PERCENTAGE),
  variant: z.nativeEnum(SaleType).default(SaleType.STANDARD),

  amount: z.coerce.number().min(0),

  dateRange: z.object(
    {
      from: z.date().nullish(),
      to: z.date().nullish(),
    },
    { required_error: "Please select a date range" }
  ),

  minimumSubtotal: z.coerce.number().optional(),
  minimumItems: z.coerce.number().optional(),
  usesPerOrder: z.coerce.number().optional(),

  quantityX: z.coerce.number().optional(),
  quantityY: z.coerce.number().optional(),

  isActive: z.boolean().default(true),

  products: z.array(z.object({ id: z.string() })),
  collections: z.array(z.object({ id: z.string() })),
});
