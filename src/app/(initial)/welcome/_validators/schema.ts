import { z } from "zod";

import { addressValidator } from "~/lib/validators/geocoding";

export const welcomeFormValidator = z.object({
  name: z.string().min(1, { message: "Store name is required" }),
  address: addressValidator,
  logo: z.string().nullable(),
  tempLogo: z.any().optional().nullable(),
});

export type WelcomeFormData = z.infer<typeof welcomeFormValidator>;
