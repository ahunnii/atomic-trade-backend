import { api } from "~/trpc/server";

import { ContentLayout } from "../_components/content-layout";
import { BlogPostClient } from "./_components/blog-post-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "Blog Posts" };

export default async function BlogAdminPage({ params }: Props) {
  const { storeSlug } = await params;

  const blogPosts = await api.blog.getAll(storeSlug);

  return (
    <ContentLayout title={`Blog Posts (${blogPosts?.length ?? 0})`}>
      <BlogPostClient storeSlug={storeSlug} blogPosts={blogPosts} />
    </ContentLayout>
  );
}
