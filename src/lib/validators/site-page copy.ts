import { z } from "zod";

import { SitePageStatus } from "@prisma/client";

export const sitePageFormValidator = z.object({
  title: z.string(),
  content: z.any(),
  status: z.nativeEnum(SitePageStatus),
  slug: z.string(),
  parentId: z.string().optional(),
  parentSlug: z.string().optional(),
});

export type SitePageFormData = z.infer<typeof sitePageFormValidator>;
