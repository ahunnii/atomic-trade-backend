import { InvoiceStatus, InvoiceType } from "@prisma/client";
import { z } from "zod";

export const addressValidator = z.object({
  street: z.string().min(1, "Street is required"),
  additional: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Zip is required"),
  country: z.string().min(1, "Country is required"),
});
export const invoiceItemValidator = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.coerce.number().min(0),
  unitPrice: z.coerce.number().min(0),
  totalPrice: z.coerce.number().min(0),
  productId: z.object({ id: z.string() }).optional().nullish(),
});

export const invoicePaymentValidator = z.object({
  id: z.string(),
  type: z.nativeEnum(InvoiceType).default("FULL"),
  amount: z.coerce.number().min(0),
  dateDue: z.date().optional().nullish(),
});

export const invoiceValidator = addressValidator.extend({
  status: z.nativeEnum(InvoiceStatus).default("DRAFT"),
  provider: z.enum(["STRIPE", "PAYPAL", "MANUAL"]),

  name: z.string(),
  email: z.string().email(),
  customerId: z.string(),
  shippingAddressId: z.string().optional(),

  lineItems: z.array(invoiceItemValidator),
  payments: z.array(invoicePaymentValidator),
});
