import type { ProductRequest } from "~/types/product-request";
import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { ProductRequestForm } from "../../_components/product-request-form";

type Props = {
  params: Promise<{ storeSlug: string; productRequestId: string }>;
};

export const metadata = {
  title: "Edit Product Request",
};

export default async function EditProductRequestPage({ params }: Props) {
  const { storeSlug, productRequestId } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const customers = await api.customer.getAll(store!.id);
  const productRequest = await api.productRequest.get(productRequestId);

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

  return (
    <ContentLayout
      title="Update Product Request"
      breadcrumbs={[
        {
          href: `/${storeSlug}/requests`,
          label: "Product Requests",
        },
      ]}
      currentPage="Update Product Request"
    >
      <ProductRequestForm
        initialData={productRequest as ProductRequest | null}
        storeId={store.id}
        storeSlug={storeSlug}
        customers={customers}
      />
    </ContentLayout>
  );
}
