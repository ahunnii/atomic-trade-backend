import { api } from "~/trpc/server";

import { DiscountClient } from "./_components/discount-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Discounts",
};

export default async function DiscountsAdminPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  if (!store) {
    return <div>Store not found</div>;
  }

  return <DiscountClient storeId={store.id} storeSlug={storeSlug} />;
}
