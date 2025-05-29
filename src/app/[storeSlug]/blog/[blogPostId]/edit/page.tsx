import { getStoreIdViaTRPC } from "~/server/actions/store";

import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { BlogPostForm } from "../../_components/blog-post-form";

type Props = {
  params: Promise<{ storeSlug: string; blogPostId: string }>;
};

export const metadata = { title: "Edit Blog Post" };

export default async function EditCollectionPage({ params }: Props) {
  const { blogPostId, storeSlug } = await params;

  const storeId = await getStoreIdViaTRPC(storeSlug);
  const blogPost = await api.blog.get(blogPostId);

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
      displayError={!blogPost}
      displayErrorText="This blog post does not exist."
      displayErrorActionHref={`/${storeSlug}/blog`}
      displayErrorActionLabel="Back to Blog Posts"
    >
      <BlogPostForm
        initialData={blogPost}
        storeId={storeId}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
