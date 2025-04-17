"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { ContentLayout } from "../../_components/content-layout";
import { productRequestColumnData } from "./product-request-column-data";

type Props = { storeId: string; storeSlug: string };

export const ProductRequestClient = ({ storeId, storeSlug }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["productRequest"],
  });

  const storeRequests = api.productRequest.getAll.useQuery(storeId);
  const deleteRequest = api.productRequest.delete.useMutation(defaultActions);

  const columnData = useMemo(() => {
    return (
      storeRequests?.data?.map((request) => ({
        ...request,
        storeSlug,
        name: request.firstName + " " + request.lastName,
        quotesSent: request.quotes.length,
        onDelete: (id: string) => deleteRequest.mutate(id),
        isLoading: deleteRequest.isPending,
      })) ?? []
    );
  }, [storeRequests?.data, deleteRequest, storeSlug]);

  return (
    <ContentLayout
      title={`Product Requests (${storeRequests?.data?.length ?? 0})`}
    >
      <div className="py-4">
        <AdvancedDataTable
          searchKey="name"
          columns={productRequestColumnData}
          data={columnData}
          addButtonLabel="Add Request"
          handleAdd={() => router.push(`/${storeSlug}/requests/new`)}
        />
      </div>
    </ContentLayout>
  );
};
