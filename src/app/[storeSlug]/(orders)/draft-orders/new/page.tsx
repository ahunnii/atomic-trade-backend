import { getStoreIdViaTRPC } from "~/server/actions/store";

import type { ProductRequestWithCustomer } from "~/types/product-request";
import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { DraftOrderForm } from "../_components/draft-order-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ productRequestId?: string }>;
};

export const metadata = { title: "New Draft Order" };

export default async function NewDraftOrderAdminPage({
  params,
  searchParams,
}: Props) {
  const { storeSlug } = await params;
  const { productRequestId } = await searchParams;

  const storeId = await getStoreIdViaTRPC(storeSlug);

  const products = await api.product.getAll(storeSlug);
  const customers = await api.customer.getAll(storeSlug);
  const productRequest = productRequestId
    ? await api.productRequest.get(productRequestId)
    : null;

  return (
    <ContentLayout
      title="New Draft Order"
      breadcrumbs={[
        {
          href: `/${storeSlug}/draft-orders`,
          label: "Draft Orders",
        },
      ]}
      currentPage="New Draft Order"
    >
      <DraftOrderForm
        initialData={null}
        products={products ?? []}
        customers={customers}
        storeId={storeId}
        storeSlug={storeSlug}
        productRequest={productRequest as ProductRequestWithCustomer | null}
      />
    </ContentLayout>
  );
}
