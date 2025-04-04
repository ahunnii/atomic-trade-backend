import { z } from "zod";

export const addressValidator = z.object({
  formatted: z.string(),
  street: z.string(),
  additional: z.string().optional().nullable(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
});

export type Address = z.infer<typeof addressValidator>;
