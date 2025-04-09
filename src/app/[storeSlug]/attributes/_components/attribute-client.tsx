"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { ContentLayout } from "../../_components/content-layout";
import { attributeColumns } from "./attributes-column-data";

type IProps = { storeId: string; storeSlug: string };

export const AttributeClient = ({ storeId, storeSlug }: IProps) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["attribute"],
  });

  const deleteAttribute = api.attribute.delete.useMutation(defaultActions);

  const duplicateAttribute = api.attribute.duplicate.useMutation({
    ...defaultActions,
    onSuccess: ({ data, message }) => {
      defaultActions.onSuccess({ message });
      void router.push(`/${storeSlug}/attributes/${data.id}/edit`);
    },
  });

  const storeAttributes = api.attribute.getAll.useQuery(storeId);

  const columnData = useMemo(() => {
    return (
      storeAttributes?.data?.map((attr) => ({
        ...attr,
        storeSlug,
        onDelete: (id: string) => deleteAttribute.mutate(id),
        onDuplicate: (id: string) => duplicateAttribute.mutate(id),
        isLoading: deleteAttribute.isPending || duplicateAttribute.isPending,
      })) ?? []
    );
  }, [storeAttributes?.data, deleteAttribute, duplicateAttribute]);

  return (
    <ContentLayout title={`Attributes (${storeAttributes?.data?.length ?? 0})`}>
      <div className="py-4">
        <AdvancedDataTable
          searchKey="name"
          columns={attributeColumns}
          data={columnData}
          addButtonLabel="Add Attribute"
          handleAdd={() => router.push(`/${storeSlug}/attributes/new`)}
        />
      </div>
    </ContentLayout>
  );
};
