import type { Collection } from "~/types/collection";
import type { Product } from "~/types/product";
import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { ProductForm } from "../../_components/product-form";

type Props = {
  params: Promise<{ storeSlug: string; productId: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { storeSlug, productId } = await params;

  const product = await api.product.get({ productId });

  const store = await api.store.getBySlug(storeSlug);

  const collections = await api.collection.getAll(store?.id ?? "");

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

  return (
    <ContentLayout
      title="Update Product"
      breadcrumbs={[
        {
          href: `/${storeSlug}/products`,
          label: "Products",
        },
      ]}
      currentPage="Update Product"
      // breadcrumbClassName="bg-background shadow p-4"
    >
      <ProductForm
        initialData={
          product as (Product & { _count: { variants: number | null } }) | null
        }
        storeId={store.id}
        storeSlug={storeSlug}
        collections={(collections as Collection[]) ?? []}
      />
    </ContentLayout>
  );
}
