import { z } from "zod";

export const showcaseItemValidator = z.object({
  id: z.string().optional(),
  title: z.string().optional().default(""),
  description: z.string().optional().default(""),
  alt: z.string().optional().default(""),
  image: z.string(),
});
