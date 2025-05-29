import type { CartWithCustomerAndItems } from "~/types/cart";
import { api } from "~/trpc/server";

import { ContentLayout } from "../_components/content-layout";
import { CartClient } from "./_components/cart-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "Carts" };

export default async function CartPage({ params }: Props) {
  const { storeSlug } = await params;

  const storeCarts = await api.cart.getAll(storeSlug);

  return (
    <ContentLayout title={`Carts (${storeCarts?.length ?? 0})`}>
      <CartClient
        storeSlug={storeSlug}
        carts={storeCarts as CartWithCustomerAndItems[]}
      />
    </ContentLayout>
  );
}
