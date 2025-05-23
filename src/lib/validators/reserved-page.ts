import { z } from "zod";

export const reservedPageValidator = z.object({
  aboutPage: z.any(),
  faqPage: z.any(),
  contactPage: z.any(),
  specialOrderPage: z.any(),

  enableAboutPage: z.boolean().optional(),
  enableFaqPage: z.boolean().optional(),
  enableContactPage: z.boolean().optional(),
  enableSpecialOrderPage: z.boolean().optional(),
});

export type ReservedPageFormData = z.infer<typeof reservedPageValidator>;
