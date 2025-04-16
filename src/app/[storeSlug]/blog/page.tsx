import { api } from "~/trpc/server";

import { BlogPostClient } from "./_components/blog-post-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Blog Posts",
};

export default async function BlogAdminPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  if (!store) {
    return <div>Store not found</div>;
  }

  return <BlogPostClient storeId={store.id} storeSlug={storeSlug} />;
}
