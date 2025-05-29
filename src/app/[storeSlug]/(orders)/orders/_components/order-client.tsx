"use client";

import { useMemo } from "react";

import type { OrderColumn } from "./order-column-data";
import type { OrderWithOrderItems } from "~/types/order";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { CreateOrderDialog } from "../../_components/create-order-dialog";
import { orderColumnData } from "./order-column-data";

type Props = {
  storeSlug: string;
  orders: OrderWithOrderItems[];
};

export const OrderClient = ({ storeSlug, orders }: Props) => {
  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["order"],
  });

  const deleteOrder = api.order.delete.useMutation(defaultActions);

  const columnData = useMemo(() => {
    return (
      orders?.map((order) => ({
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
  }, [orders, deleteOrder, storeSlug]);

  return (
    <AdvancedDataTable
      searchKey="orderNumber"
      columns={orderColumnData}
      data={columnData as unknown as OrderColumn[]}
      addButton={<CreateOrderDialog storeSlug={storeSlug} />}
    />
  );
};
