import { api } from "~/trpc/server";

import { CartClient } from "./_components/cart-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Cart",
};

export default async function CartPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  if (!store) {
    return <div>Store not found</div>;
  }

  return <CartClient storeId={store.id} storeSlug={storeSlug} />;
}
