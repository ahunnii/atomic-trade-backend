import { getStoreIdViaTRPC } from "~/server/actions/store";

import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { ProductForm } from "../../_components/product-form";

type Props = {
  params: Promise<{ storeSlug: string; productId: string }>;
};

export const metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: Props) {
  const { storeSlug, productId } = await params;

  const storeId = await getStoreIdViaTRPC(storeSlug);

  const product = await api.product.get({ productId });

  const collections = await api.collection.getAll(storeSlug);

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
      displayError={!product}
      displayErrorText="This product does not exist."
      displayErrorActionHref={`/${storeSlug}/products`}
      displayErrorActionLabel="Back to Products"
    >
      <ProductForm
        initialData={product}
        storeId={storeId}
        storeSlug={storeSlug}
        collections={collections ?? []}
      />
    </ContentLayout>
  );
}
