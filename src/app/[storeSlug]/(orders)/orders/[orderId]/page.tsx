import type { Order } from "~/types/order";
import { api } from "~/trpc/server";

import { SingleOrderClient } from "./_components/single-order-client";

type Props = {
  params: Promise<{ storeSlug: string; orderId: string }>;
};

export const metadata = {
  title: "Orders",
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
    <SingleOrderClient
      orderId={orderId}
      storeSlug={storeSlug}
      order={order as unknown as Order}
      areItemsRefundable={store?.areItemsRefundable}
      areItemsExchangeable={store?.areItemsExchangeable}
      customers={customers}
    />
  );
}
