"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import type { BlogPost } from "@prisma/client";

import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { blogPostColumnData } from "./blog-post-column-data";

type Props = { storeSlug: string; blogPosts: BlogPost[] };

export const BlogPostClient = ({ storeSlug, blogPosts }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["blog"],
  });

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
      blogPosts?.map((blogPost) => ({
        ...blogPost,
        storeSlug,
        onDelete: (id: string) => deleteBlogPost.mutate(id),
        isLoading: deleteBlogPost.isPending || duplicateBlogPost.isPending,
        onDuplicate: (id: string) => duplicateBlogPost.mutate(id),
      })) ?? []
    );
  }, [blogPosts, deleteBlogPost, duplicateBlogPost, storeSlug]);

  return (
    <AdvancedDataTable
      searchKey="title"
      columns={blogPostColumnData}
      data={columnData}
      addButtonLabel="Add Blog Post"
      handleAdd={() => router.push(`/${storeSlug}/blog/new`)}
    />
  );
};
