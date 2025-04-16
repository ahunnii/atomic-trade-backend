import type { BlogStatus } from "@prisma/client";

export type BlogPost = {
  id: string;
  title: string;
  content: Record<string, unknown>;
  slug: string;
  status: BlogStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  storeId: string;
  tags: string[];
  cover?: string | null;
};
