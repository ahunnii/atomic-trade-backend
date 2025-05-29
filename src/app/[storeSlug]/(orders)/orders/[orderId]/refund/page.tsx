import type { OrderWithOrderItems } from "~/types/order";
import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { RefundOrderClient } from "../_components/refund-order-client";

type Props = {
  params: Promise<{ storeSlug: string; orderId: string }>;
};

export const metadata = { title: "Refund Order" };

export default async function RefundOrderPage({ params }: Props) {
  const { storeSlug, orderId } = await params;

  const store = await api.store.getBySlug(storeSlug);
  const order = await api.order.get(orderId);
  const customers = await api.customer.getAll(storeSlug);

  return (
    <ContentLayout title={`Refund Order`}>
      <RefundOrderClient
        orderId={orderId}
        storeSlug={storeSlug}
        order={order as OrderWithOrderItems}
        areItemsRefundable={store!.areItemsRefundable}
        areItemsExchangeable={store!.areItemsExchangeable}
        customers={customers}
      />
    </ContentLayout>
  );
}
