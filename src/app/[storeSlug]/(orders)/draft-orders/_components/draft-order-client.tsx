"use client";

import { useMemo } from "react";

import type { DraftOrderColumn } from "./draft-order-column-data";
import type { OrderWithOrderItems } from "~/types/order";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { CreateOrderDialog } from "../../_components/create-order-dialog";
import { draftOrderColumnData } from "./draft-order-column-data";

type Props = {
  storeSlug: string;
  orders: OrderWithOrderItems[];
};

export const DraftOrderClient = ({ storeSlug, orders }: Props) => {
  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["order"],
  });

  const deleteOrder = api.order.delete.useMutation(defaultActions);

  const columnData = useMemo(() => {
    return (
      orders?.map((order) => ({
        ...order,
        storeSlug,
        paymentStatus: order?.paidInFull ? "PAID" : "UNPAID",
        fulfillmentStatus: order?.fulfillment?.status ?? "PENDING",
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
      columns={draftOrderColumnData}
      data={columnData as unknown as DraftOrderColumn[]}
      addButton={<CreateOrderDialog storeSlug={storeSlug} />}
    />
  );
};
