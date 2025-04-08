import { z } from "zod";

export const policiesValidator = z.object({
  "refund-policy": z.object({
    title: z.string(),
    content: z.string(),
    slug: z.string(),
  }),

  "privacy-policy": z.object({
    title: z.string(),
    content: z.string(),
    slug: z.string(),
  }),

  "shipping-policy": z.object({
    title: z.string(),
    content: z.string(),
    slug: z.string(),
  }),

  "terms-of-service": z.object({
    title: z.string(),
    content: z.string(),
    slug: z.string(),
  }),

  "contact-policy": z.object({
    title: z.string(),
    content: z.string(),
    slug: z.string(),
  }),
});
