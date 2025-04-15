import { api } from "~/trpc/server";

import { DraftOrderClient } from "./_components/draft-order-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Draft Orders",
};

export default async function DraftOrdersPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);

  if (!store) {
    return <div>Store not found</div>;
  }

  return <DraftOrderClient storeId={store.id} storeSlug={storeSlug} />;
}
