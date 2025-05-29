import { getStoreIdViaTRPC } from "~/server/actions/store";

import type { ProductRequestWithCustomer } from "~/types/product-request";
import { api } from "~/trpc/server";
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
  const storeId = await getStoreIdViaTRPC(storeSlug);
  const customers = await api.customer.getAll(storeSlug);
  const productRequest = await api.productRequest.get(productRequestId);

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
      displayError={!productRequest}
      displayErrorText="This product request does not exist."
      displayErrorActionHref={`/${storeSlug}/requests`}
      displayErrorActionLabel="Back to Product Requests"
    >
      <ProductRequestForm
        initialData={productRequest as ProductRequestWithCustomer}
        storeId={storeId}
        storeSlug={storeSlug}
        customers={customers}
      />
    </ContentLayout>
  );
}
