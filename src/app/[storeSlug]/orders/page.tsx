import { api } from "~/trpc/server";

import { OrderClient } from "./_components/order-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Orders",
};

export default async function OrdersPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);

  if (!store) {
    return <div>Store not found</div>;
  }

  return <OrderClient storeId={store.id} storeSlug={storeSlug} />;
}
