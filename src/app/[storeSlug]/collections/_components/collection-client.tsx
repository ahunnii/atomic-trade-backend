"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { ContentLayout } from "../../_components/content-layout";
import { collectionColumnData } from "./collection-column-data";

type Props = { storeId: string; storeSlug: string };

export const CollectionClient = ({ storeId, storeSlug }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["collection"],
  });

  const storeCollections = api.collection.getAll.useQuery(storeId);
  const deleteCollection = api.collection.delete.useMutation(defaultActions);
  const duplicateCollection = api.collection.duplicate.useMutation({
    ...defaultActions,
    onSuccess: ({ data, message }) => {
      defaultActions.onSuccess({ message });
      void router.push(`/${storeSlug}/collections/${data.id}/edit`);
    },
  });

  const columnData = useMemo(() => {
    return (
      storeCollections?.data?.map((product) => ({
        ...product,
        storeSlug,
        products: product.products.length,
        onDelete: (id: string) => deleteCollection.mutate(id),
        isLoading: deleteCollection.isPending || duplicateCollection.isPending,
        onDuplicate: (id: string) => duplicateCollection.mutate(id),
      })) ?? []
    );
  }, [
    storeCollections?.data,
    deleteCollection,
    duplicateCollection,
    storeSlug,
  ]);

  return (
    <ContentLayout
      title={`Collections (${storeCollections?.data?.length ?? 0})`}
    >
      <div className="py-4">
        <AdvancedDataTable
          searchKey="name"
          columns={collectionColumnData}
          data={columnData}
          addButtonLabel="Add Collection"
          handleAdd={() => router.push(`/${storeSlug}/collections/new`)}
        />
      </div>
    </ContentLayout>
  );
};
