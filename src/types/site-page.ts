import type { SitePageStatus } from "@prisma/client";

export type SitePage = {
  id: string;
  title: string;
  content: Record<string, unknown>;
  slug: string;
  status: SitePageStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  storeId: string;
  parentId: string | null;
  parentSlug: string | null;
};
