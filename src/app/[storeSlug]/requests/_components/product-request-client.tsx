"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import type { ProductRequestWithQuotes } from "~/types/product-request";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { productRequestColumnData } from "./product-request-column-data";

type Props = {
  storeSlug: string;
  requests: ProductRequestWithQuotes[];
};

export const ProductRequestClient = ({ storeSlug, requests }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["productRequest"],
  });

  const deleteRequest = api.productRequest.delete.useMutation(defaultActions);

  const columnData = useMemo(() => {
    return (
      requests?.map((request) => ({
        ...request,
        storeSlug,
        name: request.firstName + " " + request.lastName,
        quotesSent: request.quotes.length,
        onDelete: (id: string) => deleteRequest.mutate(id),
        isLoading: deleteRequest.isPending,
      })) ?? []
    );
  }, [requests, deleteRequest, storeSlug]);

  return (
    <AdvancedDataTable
      searchKey="name"
      columns={productRequestColumnData}
      data={columnData}
      addButtonLabel="Add Request"
      handleAdd={() => router.push(`/${storeSlug}/requests/new`)}
    />
  );
};
