"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import type { SitePage } from "@prisma/client";

import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { sitePageColumnData } from "./site-page-column-data";

type Props = { sitePages: SitePage[]; storeSlug: string };

export const SitePageClient = ({ sitePages, storeSlug }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["sitePage"],
  });

  const deleteSitePage = api.sitePage.delete.useMutation(defaultActions);
  const duplicateSitePage = api.sitePage.duplicate.useMutation({
    ...defaultActions,
    onSuccess: ({ data, message }) => {
      defaultActions.onSuccess({ message });
      void router.push(`/${storeSlug}/pages/site/${data.id}/edit`);
    },
  });

  const columnData = useMemo(() => {
    return (
      sitePages?.map((blogPost) => ({
        ...blogPost,
        storeSlug,
        onDelete: (id: string) => deleteSitePage.mutate(id),
        isLoading: deleteSitePage.isPending || duplicateSitePage.isPending,
        onDuplicate: (id: string) => duplicateSitePage.mutate(id),
      })) ?? []
    );
  }, [sitePages, deleteSitePage, duplicateSitePage, storeSlug]);

  return (
    <AdvancedDataTable
      searchKey="title"
      columns={sitePageColumnData}
      data={columnData}
      addButtonLabel="Add Site Page"
      handleAdd={() => router.push(`/${storeSlug}/site-pages/new`)}
    />
  );
};
