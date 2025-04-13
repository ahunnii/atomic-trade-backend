import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";

import { addressValidator } from "./geocoding";

export const customerValidator = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .or(z.literal("")),
  address: addressValidator,
  tags: z.array(z.object({ id: z.string(), text: z.string() })),
  notes: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerValidator>;
