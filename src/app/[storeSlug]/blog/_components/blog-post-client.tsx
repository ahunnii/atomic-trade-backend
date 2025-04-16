"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { ContentLayout } from "../../_components/content-layout";
import { blogPostColumnData } from "./blog-post-column-data";

type Props = { storeId: string; storeSlug: string };

export const BlogPostClient = ({ storeId, storeSlug }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["blog"],
  });

  const storeBlogPosts = api.blog.getAll.useQuery(storeId);
  const deleteBlogPost = api.blog.delete.useMutation(defaultActions);
  const duplicateBlogPost = api.blog.duplicate.useMutation({
    ...defaultActions,
    onSuccess: ({ data, message }) => {
      defaultActions.onSuccess({ message });
      void router.push(`/${storeSlug}/blog/${data.id}/edit`);
    },
  });

  const columnData = useMemo(() => {
    return (
      storeBlogPosts?.data?.map((blogPost) => ({
        ...blogPost,
        storeSlug,
        onDelete: (id: string) => deleteBlogPost.mutate(id),
        isLoading: deleteBlogPost.isPending || duplicateBlogPost.isPending,
        onDuplicate: (id: string) => duplicateBlogPost.mutate(id),
      })) ?? []
    );
  }, [storeBlogPosts?.data, deleteBlogPost, duplicateBlogPost, storeSlug]);

  return (
    <ContentLayout title={`Blog Posts (${storeBlogPosts?.data?.length ?? 0})`}>
      <div className="py-4">
        <AdvancedDataTable
          searchKey="title"
          columns={blogPostColumnData}
          data={columnData}
          addButtonLabel="Add Blog Post"
          handleAdd={() => router.push(`/${storeSlug}/blog/new`)}
        />
      </div>
    </ContentLayout>
  );
};
