import { z } from "zod";

// import { ProductStatus, ProductType } from "@prisma/client";
import { ProductStatus, ProductType } from "@prisma/client";

import { attributeValidator, productAttributeValidator } from "./attribute";

// Enum validators
export const ProductStatusEnum = z.enum([
  "DRAFT",
  "ACTIVE",
  "ARCHIVED",
  "SOLD_OUT",
  "CUSTOM",
]);

export const ProductTypeEnum = z.enum(["PHYSICAL", "DIGITAL", "SERVICE"]);

const StockStatusEnum = z.enum(["IN_STOCK", "OUT_OF_STOCK", "PRE_ORDER"]);

// Dimension validator
export const dimensionValidator = z.object({
  weight: z.coerce.number().optional(),
  length: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
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
  id: z.string(),
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
  dimensions: dimensionValidator,
  variants: z.array(variationValidator).min(1),
  additionalInfo: z.array(additionalInfoValidator),
  materials: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  attributes: z.array(attributeValidator).default([]),
});

export const productFormValidator = z.object({
  name: z.string().min(1),
  description: z.string(),
  additionalInfo: z.any(),
  isFeatured: z.boolean().default(false).optional(),
  status: z.nativeEnum(ProductStatus),
  attributes: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      values: z.array(z.string()),
    }),
  ),
  variants: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        values: z.array(z.string()),
        priceInCents: z.coerce.number(),
        stock: z.coerce.number(),
        sku: z.string().optional().nullish(),
        imageUrl: z.string().optional().nullish(),
        manageStock: z.boolean().default(false).optional(),
      }),
    )
    .min(1),

  tempImages: z.array(z.any().optional().nullable()),
  images: z.array(z.string()),

  featuredImage: z.string().optional(),
  tempFeaturedImage: z.any().optional().nullable(),

  // type: z.nativeEnum(ProductType),
  // estimatedCompletion: z.coerce.number().min(0).optional(),
  // shippingCost: z.coerce.number().min(0).optional(),
  // dimensions: dimensionValidator,
  // tags: z.array(z.object({ id: z.string(), text: z.string() })),
  // materials: z.array(z.object({ id: z.string(), text: z.string() })),
});

export type Product = z.infer<typeof productValidator>;

export type ProductFormData = z.infer<typeof productFormValidator>;
