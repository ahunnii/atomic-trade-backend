"use client";

import { useMemo } from "react";

import type { DraftOrderColumn } from "./draft-order-column-data";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { CreateOrderDialog } from "../../_components/create/create-order-dialog";
import { ContentLayout } from "../../../_components/content-layout";
import { draftOrderColumnData } from "./draft-order-column-data";

type Props = { storeId: string; storeSlug: string };

export const DraftOrderClient = ({ storeId, storeSlug }: Props) => {
  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["order"],
  });

  const storeOrders = api.order.getAllDrafts.useQuery(storeId);
  const deleteOrder = api.order.delete.useMutation(defaultActions);

  const columnData = useMemo(() => {
    return (
      storeOrders?.data?.map((order) => ({
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
  }, [storeOrders?.data, deleteOrder, storeSlug]);

  return (
    <ContentLayout title={`Draft Orders (${storeOrders?.data?.length ?? 0})`}>
      <div className="py-4">
        <AdvancedDataTable
          searchKey="orderNumber"
          columns={draftOrderColumnData}
          data={columnData as unknown as DraftOrderColumn[]}
          addButton={<CreateOrderDialog storeSlug={storeSlug} />}
        />
      </div>
    </ContentLayout>
  );
};
