import type { DiscountAmountType, DiscountType } from "@prisma/client";

import type { Collection } from "./collection";
import type { Customer } from "./customer";
import type { Variation } from "./product";

// export enum DiscountAmountType {
//   PERCENTAGE = "PERCENTAGE",
//   FIXED = "FIXED",
// }

// export enum DiscountType {
//   PRODUCT = "PRODUCT",
//   ORDER = "ORDER",
//   SHIPPING = "SHIPPING",
// }

export type Discount = {
  id: string;
  code: string;
  description?: string | null;
  uses?: number | null;
  type: DiscountType;
  applyToAllCountries: boolean;
  applyToAllProducts: boolean;
  amountType: DiscountAmountType;
  amount: number;
  countryCodes: string[];
  variants: Variation[]; // Replace with proper Variation type when available
  collections: Collection[]; // Replace with proper Collection type when available
  customers: Customer[]; // Replace with proper Customer type when available
  minimumPurchaseInCents?: number;
  minimumQuantity?: number;
  isAutomatic: boolean;
  combineWithProductDiscounts: boolean;
  combineWithOrderDiscounts: boolean;
  combineWithShippingDiscounts: boolean;
  limitOncePerCustomer: boolean;
  applyToOrder: boolean;
  applyToShipping: boolean;
  maximumUses?: number | null;
  maximumAmountForShippingInCents?: number | null;
  startsAt: Date;
  endsAt?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  storeId: string;
  //   store: any; // Replace with proper Store type when available
};
