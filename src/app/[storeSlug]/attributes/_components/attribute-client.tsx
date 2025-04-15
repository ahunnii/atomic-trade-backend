"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { ContentLayout } from "../../_components/content-layout";
import { attributeColumns } from "./attributes-column-data";

type Props = { storeId: string; storeSlug: string };

export const AttributeClient = ({ storeId, storeSlug }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["attribute"],
  });

  const deleteAttribute = api.attribute.delete.useMutation(defaultActions);

  const storeAttributes = api.attribute.getAll.useQuery(storeId);

  const columnData = useMemo(() => {
    return (
      storeAttributes?.data?.map((attr) => ({
        ...attr,
        storeSlug,
        onDelete: (id: string) => deleteAttribute.mutate(id),

        isLoading: deleteAttribute.isPending,
      })) ?? []
    );
  }, [storeAttributes?.data, deleteAttribute, storeSlug]);

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
