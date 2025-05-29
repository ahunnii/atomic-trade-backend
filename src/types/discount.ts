import type {
  Collection,
  Customer,
  Discount,
  Product,
  Variation,
} from "@prisma/client";

export type DiscountWithProducts = Discount & {
  products: Product[];
  collections: Collection[];
  customers: Customer[];
  variants: Variation[];
};
