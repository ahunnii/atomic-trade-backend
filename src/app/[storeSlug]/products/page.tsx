import { api } from "~/trpc/server";

import { ContentLayout } from "../_components/content-layout";
import { ProductClient } from "./_components/product-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "Products" };

export default async function ProductsPage({ params }: Props) {
  const { storeSlug } = await params;

  const storeProducts = await api.product.getAll(storeSlug);

  return (
    <ContentLayout title={`Products (${storeProducts?.length ?? 0})`}>
      <ProductClient storeSlug={storeSlug} products={storeProducts} />
    </ContentLayout>
  );
}
