import { api } from "~/trpc/server";

import { ProductClient } from "./_components/product-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Products",
};

export default async function ProductsPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);

  if (!store) {
    return <div>Store not found</div>;
  }

  return <ProductClient storeId={store.id} storeSlug={storeSlug} />;
}
