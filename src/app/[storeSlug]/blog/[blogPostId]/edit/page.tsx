import type { BlogPost } from "~/types/blog";
import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { BlogPostForm } from "../../_components/blog-post-form";

type Props = {
  params: Promise<{ storeSlug: string; blogPostId: string }>;
};

export const metadata = {
  title: "Edit Blog Post",
};

export default async function EditCollectionPage({ params }: Props) {
  const { storeSlug, blogPostId } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const blogPost = await api.blog.get(blogPostId);

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

  return (
    <ContentLayout
      title="Update Blog Post"
      breadcrumbs={[
        {
          href: `/${storeSlug}/blog`,
          label: "Blog Posts",
        },
      ]}
      currentPage="Update Blog Post"
      // breadcrumbClassName="bg-background shadow p-4"
    >
      <BlogPostForm
        initialData={blogPost as BlogPost | null}
        storeId={store.id}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
