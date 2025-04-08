import { z } from "zod";

export const contentPageValidator = z.object({
  content: z.string(),
  slug: z.string(),
  title: z.string(),
});
