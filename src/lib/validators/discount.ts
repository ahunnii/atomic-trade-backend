import { z } from "zod";

import { DiscountAmountType, DiscountType } from "~/types/discount";

export const discountFormValidator = z.object({
  code: z.string(),
  description: z.string().optional(),
  type: z.nativeEnum(DiscountType),
  amountType: z.nativeEnum(DiscountAmountType),
  amount: z.coerce.number(),
  countryCodes: z.array(z.string()),
  minimumPurchaseInCents: z.coerce.number().optional(),
  minimumQuantity: z.coerce.number().optional(),
  isAutomatic: z.boolean(),
  combineWithProductDiscounts: z.boolean(),
  combineWithOrderDiscounts: z.boolean(),
  combineWithShippingDiscounts: z.boolean(),
  limitOncePerCustomer: z.boolean(),
  applyToOrder: z.boolean(),
  applyToShipping: z.boolean(),
  maximumUses: z.coerce.number().optional(),
  maximumAmountForShippingInCents: z.coerce.number().optional(),
  startsAt: z.date(),
  endsAt: z.date().optional(),
  isActive: z.boolean(),

  ///
  minimumRequirementType: z.string().optional(),
  maximumRequirementType: z.array(z.string()).optional(),
  shippingCountryRequirementType: z.string().optional(),

  variants: z.array(z.object({ id: z.string() })),
  collections: z.array(z.object({ id: z.string() })),
  customers: z.array(z.object({ id: z.string() })),

  applyToAllProducts: z.boolean(),
  applyToAllCountries: z.boolean(),
});

export type DiscountFormData = z.infer<typeof discountFormValidator>;
