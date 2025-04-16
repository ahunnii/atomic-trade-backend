"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import type { OrderColumn } from "./order-column-data";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { CreateOrderDialog } from "../../_components/create/create-order-dialog";
import { ContentLayout } from "../../../_components/content-layout";
import { orderColumnData } from "./order-column-data";

type Props = { storeId: string; storeSlug: string };

export const OrderClient = ({ storeId, storeSlug }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["order"],
  });

  const storeOrders = api.order.getAll.useQuery(storeId);
  const deleteOrder = api.order.delete.useMutation(defaultActions);

  const columnData = useMemo(() => {
    return (
      storeOrders?.data?.map((order) => ({
        ...order,
        storeSlug,
        paymentStatus: order?.paymentStatus,
        fulfillmentStatus: order?.fulfillmentStatus,
        deliveryMethod: order?.fulfillment?.type ?? "MANUAL",
        numberOfItems: order.orderItems.reduce(
          (acc, current) => current.quantity + acc,
          0,
        ),

        onDelete: (id: string) => deleteOrder.mutate(id),
        isLoading: deleteOrder.isPending,
      })) ?? []
    );
  }, [storeOrders?.data, deleteOrder, storeSlug]);

  return (
    <ContentLayout title={`Orders (${storeOrders?.data?.length ?? 0})`}>
      <div className="py-4">
        <AdvancedDataTable
          searchKey="orderNumber"
          columns={orderColumnData}
          data={columnData as unknown as OrderColumn[]}
          addButton={<CreateOrderDialog storeSlug={storeSlug} />}
        />
      </div>
    </ContentLayout>
  );
};
