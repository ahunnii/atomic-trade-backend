import type { Order } from "~/types/order";
import { api } from "~/trpc/server";

import { FulfillmentSingleOrderClient } from "../_components/fulfillment-order-client";

type Props = {
  params: Promise<{ storeSlug: string; orderId: string }>;
};

export const metadata = {
  title: "Fulfill Order",
};

export default async function OrdersPage({ params }: Props) {
  const { storeSlug, orderId } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const order = await api.order.get(orderId);
  const customers = await api.customer.getAll(store?.id ?? "");
  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <FulfillmentSingleOrderClient
      orderId={orderId}
      storeSlug={storeSlug}
      order={order as unknown as Order}
      areItemsRefundable={store?.areItemsRefundable}
      areItemsExchangeable={store?.areItemsExchangeable}
      customers={customers}
    />
  );
}
