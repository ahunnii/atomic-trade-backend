import { ProductStatus } from "@prisma/client";

import { ProductType } from "@prisma/client";
import { z } from "zod";

export const variantValidator = z.object({
  id: z.string(),
  name: z.string().default("DEFAULT"),
  values: z.array(z.string()),
  price: z.coerce.number().min(0),
  quantity: z.coerce.number().min(0),
  sku: z.string().optional(),
  imageUrl: z.string().optional(),
  deletedAt: z.date().optional().nullish(),
});

export const productValidator = z.object({
  slug: z.string().optional(),
  name: z.string().min(1),
  description: z.string(),
  featuredImage: z.string().min(1, {
    message: "You need at least a featured image",
  }),
  isFeatured: z.boolean().default(false).optional(),
  type: z.nativeEnum(ProductType),
  status: z.nativeEnum(ProductStatus),
  weight: z.coerce.number().min(0).optional(),
  length: z.coerce.number().min(0).optional(),
  width: z.coerce.number().min(0).optional(),
  height: z.coerce.number().min(0).optional(),
  estimatedCompletion: z.coerce.number().min(0).int(),
  weight_oz: z.coerce.number().min(0).optional(),
  weight_lb: z.coerce.number().min(0).optional(),
  shippingCost: z.coerce.number().min(0).optional(),
  tags: z.array(z.object({ name: z.string(), id: z.string() })),
  materials: z.array(z.object({ name: z.string(), id: z.string() })),
  images: z.array(z.string()),
  variants: z.array(variantValidator).min(1),
  attributes: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      values: z.array(z.string()),
    })
  ),
  infoSections: z.array(
    z.object({ id: z.string(), title: z.string(), description: z.string() })
  ),
  deletedAt: z.date().optional().nullish(),
});
