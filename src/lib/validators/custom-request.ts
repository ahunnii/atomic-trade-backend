import { InvoiceType } from "@prisma/client";

import { PaymentStatus } from "@prisma/client";

import { PaymentProvider } from "@prisma/client";

import { RequestStatus } from "@prisma/client";

import { z } from "zod";

export const requestValidator = z.object({
  name: z.string(),
  email: z.string().email(),

  customerId: z.string(),

  details: z.string(),
  notes: z.string().optional(),
  images: z.array(z.string()).max(3),

  status: z.nativeEnum(RequestStatus),

  estimatedCompletionAt: z.date().optional().nullish(),
  paidInFullAt: z.date().optional().nullish(),

  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional().nullish(),
      quantity: z.coerce.number().min(0),
      totalPrice: z.coerce.number().min(0),
      unitPrice: z.coerce.number().min(0).optional().nullish(),
      productId: z.string().optional().nullish(),
    })
  ),
  payments: z.array(
    z.object({
      id: z.string(),
      provider: z.nativeEnum(PaymentProvider).optional().default("STRIPE"),
      providerId: z.string().optional().nullish(),
      providerUrl: z.string().optional().nullish(),
      amount: z.coerce.number().min(0),
      status: z.nativeEnum(PaymentStatus).default("DRAFT"),
      type: z.nativeEnum(InvoiceType).default("FULL"),

      issuedAt: z.date().optional().nullish(),
      dueAt: z.date().optional().nullish(),
      expiresAt: z.date().optional().nullish(),
      paidAt: z.date().optional().nullish(),
    })
  ),
});

export const customerFacingRequestValidator = z.object({
  name: z.string(),
  email: z.string().email(),
  request: z.string(),
  images: z.array(z.string()),
});
