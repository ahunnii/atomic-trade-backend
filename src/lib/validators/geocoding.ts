import { z } from "zod";

export const addressValidator = z.object({
  id: z.string(),
  formatted: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  street: z.string(),
  additional: z.string().optional().nullable(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  isDefault: z.boolean().optional().nullable(),
  customerId: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
});

export type Address = z.infer<typeof addressValidator>;
