import { z } from "zod";

// Enum validators
const ProductStatusEnum = z.enum([
  "DRAFT",
  "ACTIVE",
  "ARCHIVED",
  "SOLD_OUT",
  "CUSTOM",
]);

const ProductTypeEnum = z.enum(["PHYSICAL", "DIGITAL", "SERVICE"]);

const StockStatusEnum = z.enum(["IN_STOCK", "OUT_OF_STOCK", "PRE_ORDER"]);

// Dimension validator
export const dimensionValidator = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  weight: z.number().nullable().default(0),
  length: z.number().nullable().default(0),
  width: z.number().nullable().default(0),
  height: z.number().nullable().default(0),
});

export type Dimension = z.infer<typeof dimensionValidator>;

// Variation validator
export const variationValidator = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  stockStatus: StockStatusEnum.default("IN_STOCK"),
  manageStock: z.boolean().default(false),
  name: z.string().default("Variation"),
  values: z.array(z.string()),
  quantity: z.number().int(),
  price: z.number().int(),
  sku: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

export type Variation = z.infer<typeof variationValidator>;

// Additional Info validator
export const additionalInfoValidator = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  title: z.string(),
  description: z.string(),
});

export type AdditionalInfo = z.infer<typeof additionalInfoValidator>;

// Product validator
export const productValidator = z.object({
  id: z.string().optional(),
  status: ProductStatusEnum.default("DRAFT"),
  type: ProductTypeEnum.default("PHYSICAL"),
  slug: z.string(),
  storeId: z.string(),
  name: z.string(),
  description: z.string(),
  isFeatured: z.boolean().default(false),
  featuredImage: z.string(),
  images: z.array(z.string()),
  dimensions: dimensionValidator.optional(),
  variants: z.array(variationValidator).optional(),
  additionalInfo: z.array(additionalInfoValidator).optional(),
  materials: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export type Product = z.infer<typeof productValidator>;
