import { api } from "~/trpc/server";

import { ProductRequestClient } from "./_components/product-request-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Product Requests",
};

export default async function ProductRequestsAdminPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  if (!store) {
    return <div>Store not found</div>;
  }

  return <ProductRequestClient storeId={store.id} storeSlug={storeSlug} />;
}
