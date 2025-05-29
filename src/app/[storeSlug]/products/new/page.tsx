import { getStoreIdViaTRPC } from "~/server/actions/store";

import { api } from "~/trpc/server";

import { ProductForm } from "../_components/product-form";
import { ContentLayout } from "../../_components/content-layout";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "New Product" };

export default async function NewProductAdminPage({ params }: Props) {
  const { storeSlug } = await params;

  const storeId = await getStoreIdViaTRPC(storeSlug);

  const collections = await api.collection.getAll(storeSlug);

  return (
    <ContentLayout
      title="New Product"
      breadcrumbs={[
        {
          href: `/${storeSlug}/products`,
          label: "Products",
        },
      ]}
      currentPage="New Product"
    >
      <ProductForm
        initialData={null}
        storeId={storeId}
        storeSlug={storeSlug}
        collections={collections ?? []}
      />
    </ContentLayout>
  );
}
