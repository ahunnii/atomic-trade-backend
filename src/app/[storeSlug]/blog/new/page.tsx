import { api } from "~/trpc/server";

import { BlogPostForm } from "../_components/blog-post-form";
import { ContentLayout } from "../../_components/content-layout";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function NewCollectionAdminPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <ContentLayout
      title="New Blog Post"
      breadcrumbs={[
        {
          href: `/${storeSlug}/blog`,
          label: "Blog Posts",
        },
      ]}
      currentPage="New Blog Post"
    >
      <BlogPostForm
        initialData={null}
        storeId={store.id}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
