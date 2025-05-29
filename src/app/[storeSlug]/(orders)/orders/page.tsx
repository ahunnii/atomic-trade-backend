import type { OrderWithOrderItems } from "~/types/order";
import { api } from "~/trpc/server";

import { ContentLayout } from "../../_components/content-layout";
import { OrderClient } from "./_components/order-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "Orders" };

export default async function OrdersPage({ params }: Props) {
  const { storeSlug } = await params;

  const storeOrders = await api.order.getAll(storeSlug);

  return (
    <ContentLayout title={`Orders (${storeOrders?.length ?? 0})`}>
      <OrderClient
        orders={storeOrders as OrderWithOrderItems[]}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
