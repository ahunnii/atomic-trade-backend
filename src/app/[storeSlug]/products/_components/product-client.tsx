"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import type { ProductWithVariations } from "~/types/product";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { productColumnData } from "./product-column-data";
import { productFilterOptions } from "./product-filter-options.admin";

type Props = {
  storeSlug: string;
  products: ProductWithVariations[];
};

export const ProductClient = ({ storeSlug, products }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["product"],
  });

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
      products?.map((product) => ({
        ...product,
        storeSlug,
        onDelete: (id: string) => deleteProduct.mutate(id),
        isLoading: deleteProduct.isPending || duplicateProduct.isPending,
        onDuplicate: (id: string) => duplicateProduct.mutate(id),
      })) ?? []
    );
  }, [products, deleteProduct, duplicateProduct, storeSlug]);

  return (
    <AdvancedDataTable
      searchKey="name"
      columns={productColumnData}
      data={columnData}
      filters={productFilterOptions}
      addButtonLabel="Add Product"
      handleAdd={() => router.push(`/${storeSlug}/products/new`)}
    />
  );
};
