import {
  FulfillmentStatus,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";
import { z } from "zod";

export const addressValidator = z.object({
  name: z.string(),
  street: z.string(),
  additional: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  country: z.string(),
});
export const orderItemValidator = z.object({
  variantId: z.string().nullish(),
  quantity: z.number().min(0),
});

export const orderValidator = z.object({
  paymentStatus: z.nativeEnum(PaymentStatus),
  fulfillmentStatus: z.nativeEnum(FulfillmentStatus),
  phone: z.string().optional(),
  email: z.string().optional(),
  billingAddress: addressValidator,
  shippingAddress: addressValidator,
  orderItems: z.array(orderItemValidator),
  subtotal: z.number().optional().default(0),
  total: z.number().optional().default(0),
  discount: z.number().optional().default(0),
  shipping: z.number().optional().default(0),
  fee: z.number().optional().default(0),
  tax: z.number().optional().default(0),
  receiptLink: z.string().optional(),
  referenceNumber: z.string().optional(),
  referenceProvider: z.string().optional(),
  couponId: z.string().optional(),
  timeline: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
});

export const updateOrderValidator = z.object({
  paymentStatus: z.nativeEnum(PaymentStatus),
  fulfillmentStatus: z.nativeEnum(FulfillmentStatus),
  phone: z.string().optional().nullish(),
  email: z.string(),
  billingAddress: addressValidator,
  shippingAddress: addressValidator,
  orderItems: z.array(orderItemValidator),
});

export const newOrderValidator = z.object({
  paymentStatus: z.nativeEnum(PaymentStatus),
  fulfillmentStatus: z.nativeEnum(FulfillmentStatus),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  street: z.string().min(1, "Street is required"),
  additional: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Zip is required"),
  country: z.string().min(1, "Country is required"),

  name: z.string().min(2),
  email: z.string().email(),
  phone: z
    .string()
    .optional()
    .nullish()
    .refine((val) => !val || (val.length >= 9 && val.length <= 12) || val, {
      message: "Phone number must be between 9 and 12 characters",
    }),

  userId: z.string().optional().nullish(),

  receiptUrl: z.string().optional().nullish(),
  paymentId: z.string().optional().nullish(),

  ignoreTax: z.boolean().optional().nullish(),
  ignoreShipping: z.boolean().optional().nullish(),
  ignoreDiscounts: z.boolean().optional().nullish(),

  orderItems: z.array(
    z.object({
      id: z.string(),
      quantity: z.coerce.number().min(0),
    })
  ),
});
