import { z } from "zod";

import { ProductRequestStatus, QuoteStatus } from "@prisma/client";

export const productQuoteValidator = z.object({
  // productRequestId: z.string(),
  id: z.string(),
  amountInCents: z.number().min(0),
  status: z.nativeEnum(QuoteStatus),
  message: z.string().optional().nullish(),
  expiresAt: z.date().optional().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const productRequestFormValidator = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional().nullish(),
  details: z.string().min(1, { message: "Details are required" }),

  tempImages: z.array(z.any().optional().nullable()),
  images: z.array(z.string()),

  status: z.nativeEnum(ProductRequestStatus),
  customerId: z.string().optional().nullish(),
  orderId: z.string().optional().nullish(),

  customer: z.object({
    id: z.string().or(z.literal("")),
    firstName: z.string().or(z.literal("")),
    lastName: z.string().or(z.literal("")),
    email: z.string().email().or(z.literal("")),
    phone: z.string().or(z.literal("")),
    ordersCount: z.number().or(z.literal(0)),
  }),
  quotes: z.array(productQuoteValidator),
});

export const customerFacingRequestValidator = z.object({
  name: z.string(),
  email: z.string().email(),
  request: z.string(),
  images: z.array(z.string()),
});

export type ProductRequestFormData = z.infer<
  typeof productRequestFormValidator
>;
