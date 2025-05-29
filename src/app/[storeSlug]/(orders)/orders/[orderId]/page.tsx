import type { OrderWithOrderItems } from "~/types/order";
import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { SingleOrderClient } from "./_components/single-order-client";

type Props = {
  params: Promise<{ storeSlug: string; orderId: string }>;
};

export const metadata = { title: "View Order" };

export default async function OrdersPage({ params }: Props) {
  const { storeSlug, orderId } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const order = await api.order.get(orderId);
  const customers = await api.customer.getAll(storeSlug);

  return (
    <ContentLayout title={`Order #${order?.orderNumber}`}>
      <SingleOrderClient
        orderId={orderId}
        storeSlug={storeSlug}
        order={order as OrderWithOrderItems}
        areItemsRefundable={store?.areItemsRefundable ?? false}
        areItemsExchangeable={store?.areItemsExchangeable ?? false}
        customers={customers}
      />
    </ContentLayout>
  );
}
