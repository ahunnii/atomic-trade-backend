"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { ContentLayout } from "../../_components/content-layout";
import { sitePageColumnData } from "./site-page-column-data";

type Props = { storeId: string; storeSlug: string };

export const SitePageClient = ({ storeId, storeSlug }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["sitePage"],
  });

  const sitePages = api.sitePage.getAll.useQuery(storeId);
  const deleteSitePage = api.sitePage.delete.useMutation(defaultActions);
  const duplicateSitePage = api.sitePage.duplicate.useMutation({
    ...defaultActions,
    onSuccess: ({ data, message }) => {
      defaultActions.onSuccess({ message });
      void router.push(`/${storeSlug}/site-pages/${data.id}/edit`);
    },
  });

  const columnData = useMemo(() => {
    return (
      sitePages?.data?.map((blogPost) => ({
        ...blogPost,
        storeSlug,
        onDelete: (id: string) => deleteSitePage.mutate(id),
        isLoading: deleteSitePage.isPending || duplicateSitePage.isPending,
        onDuplicate: (id: string) => duplicateSitePage.mutate(id),
      })) ?? []
    );
  }, [sitePages?.data, deleteSitePage, duplicateSitePage, storeSlug]);

  return (
    <ContentLayout title={`Site Pages (${sitePages?.data?.length ?? 0})`}>
      <div className="py-4">
        <AdvancedDataTable
          searchKey="title"
          columns={sitePageColumnData}
          data={columnData}
          addButtonLabel="Add Site Page"
          handleAdd={() => router.push(`/${storeSlug}/site-pages/new`)}
        />
      </div>
    </ContentLayout>
  );
};
