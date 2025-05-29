import type { OrderWithOrderItems } from "~/types/order";
import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { FulfillmentSingleOrderClient } from "../_components/fulfillment-order-client";

type Props = {
  params: Promise<{ storeSlug: string; orderId: string }>;
};

export const metadata = { title: "Fulfill Order" };

export default async function FulfillOrdersPage({ params }: Props) {
  const { storeSlug, orderId } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const order = await api.order.get(orderId);
  const customers = await api.customer.getAll(storeSlug);

  return (
    <ContentLayout
      title={`Order #${order?.orderNumber}`}
      breadcrumbs={[
        {
          label: "Orders",
          href: `/${storeSlug}/orders`,
        },
        {
          label: `Order #${order?.orderNumber}`,
          href: `/${storeSlug}/orders/${order?.id}`,
        },
      ]}
      currentPage="Fulfill Order"
    >
      <FulfillmentSingleOrderClient
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
