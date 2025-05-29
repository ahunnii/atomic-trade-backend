import { getStoreIdViaTRPC } from "~/server/actions/store";

import { BlogPostForm } from "../_components/blog-post-form";
import { ContentLayout } from "../../_components/content-layout";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "New Blog Post" };

export default async function NewBlogPostAdminPage({ params }: Props) {
  const { storeSlug } = await params;
  const storeId = await getStoreIdViaTRPC(storeSlug);

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
        storeId={storeId}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
