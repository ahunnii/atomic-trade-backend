"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import type { CollectionWithProducts } from "~/types/collection";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { collectionColumnData } from "./collection-column-data";

type Props = {
  storeSlug: string;
  collections: CollectionWithProducts[];
};

export const CollectionClient = ({ storeSlug, collections }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["collection"],
  });

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
      collections?.map((product) => ({
        ...product,
        storeSlug,
        products: product.products.length,
        onDelete: (id: string) => deleteCollection.mutate(id),
        isLoading: deleteCollection.isPending || duplicateCollection.isPending,
        onDuplicate: (id: string) => duplicateCollection.mutate(id),
      })) ?? []
    );
  }, [collections, deleteCollection, duplicateCollection, storeSlug]);

  return (
    <AdvancedDataTable
      searchKey="name"
      columns={collectionColumnData}
      data={columnData}
      addButtonLabel="Add Collection"
      handleAdd={() => router.push(`/${storeSlug}/collections/new`)}
    />
  );
};
