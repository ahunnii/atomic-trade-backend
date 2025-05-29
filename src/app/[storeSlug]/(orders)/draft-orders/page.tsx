import type { OrderWithOrderItems } from "~/types/order";
import { api } from "~/trpc/server";

import { ContentLayout } from "../../_components/content-layout";
import { DraftOrderClient } from "./_components/draft-order-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Draft Orders",
};

export default async function DraftOrdersPage({ params }: Props) {
  const { storeSlug } = await params;

  const storeOrders = await api.order.getAllDrafts(storeSlug);

  return (
    <ContentLayout title={`Draft Orders (${storeOrders?.length ?? 0})`}>
      <DraftOrderClient
        storeSlug={storeSlug}
        orders={storeOrders as OrderWithOrderItems[]}
      />
    </ContentLayout>
  );
}
