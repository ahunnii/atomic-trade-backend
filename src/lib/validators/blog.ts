import { z } from "zod";

import { BlogStatus } from "@prisma/client";

export const blogPostFormValidator = z.object({
  title: z.string(),
  content: z.any(),
  status: z.nativeEnum(BlogStatus),
  tags: z.array(z.object({ id: z.string(), text: z.string() })),
  tempCover: z.any().optional().nullable(),
  cover: z.string().optional(),
});

export type BlogPostFormData = z.infer<typeof blogPostFormValidator>;
