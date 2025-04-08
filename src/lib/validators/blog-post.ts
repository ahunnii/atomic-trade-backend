import { z } from "zod";
export const blogPostValidator = z.object({
  title: z.string().min(1),
  cover: z.string().optional(),
  tags: z.array(z.object({ name: z.string(), id: z.string() })),
  content: z.string(),
  author: z.string().optional(),
  slug: z.string().optional(),
  published: z.boolean(),
});
