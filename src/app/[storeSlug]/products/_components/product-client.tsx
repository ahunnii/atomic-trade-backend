"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { ContentLayout } from "../../_components/content-layout";
import { productColumnData } from "./product-column-data";
import { productFilterOptions } from "./product-filter-options.admin";

type Props = { storeId: string; storeSlug: string };

export const ProductClient = ({ storeId, storeSlug }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["product"],
  });

  const storeProducts = api.product.getAll.useQuery({ storeId });

  const deleteProduct = api.product.delete.useMutation(defaultActions);

  const duplicateProduct = api.product.duplicate.useMutation({
    ...defaultActions,
    onSuccess: ({ data, message }) => {
      defaultActions.onSuccess({ message });
      void router.push(`/${storeSlug}/products/${data.id}/edit`);
    },
  });

  const columnData = useMemo(() => {
    return (
      storeProducts?.data?.map((product) => ({
        ...product,
        storeSlug,
        onDelete: (id: string) => deleteProduct.mutate(id),
        isLoading: deleteProduct.isPending || duplicateProduct.isPending,
        onDuplicate: (id: string) => duplicateProduct.mutate(id),
      })) ?? []
    );
  }, [storeProducts?.data, deleteProduct, duplicateProduct, storeSlug]);

  return (
    <ContentLayout title={`Products (${storeProducts?.data?.length ?? 0})`}>
      <div className="py-4">
        <AdvancedDataTable
          searchKey="name"
          columns={productColumnData}
          data={columnData}
          filters={productFilterOptions}
          addButtonLabel="Add Product"
          handleAdd={() => router.push(`/${storeSlug}/products/new`)}
        />
      </div>
    </ContentLayout>
  );
};
