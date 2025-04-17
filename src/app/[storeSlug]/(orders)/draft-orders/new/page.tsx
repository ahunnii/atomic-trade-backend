import type { ProductRequest } from "~/types/product-request";
import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { DraftOrderForm } from "../_components/draft-order-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ productRequestId?: string }>;
};

export const metadata = {
  title: "New Draft Order",
  description: "Create a new draft order",
};

export default async function NewDraftOrderAdminPage({
  params,
  searchParams,
}: Props) {
  const { storeSlug } = await params;
  const { productRequestId } = await searchParams;
  const store = await api.store.getBySlug(storeSlug);
  const products = await api.product.getAll({ storeId: store!.id });
  const customers = await api.customer.getAll(store!.id);
  const productRequest = productRequestId
    ? await api.productRequest.get(productRequestId)
    : null;

  if (!store) {
    return <div>Store not found</div>;
  }

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
        customers={customers ?? []}
        storeId={store.id}
        storeSlug={storeSlug}
        productRequest={productRequest as ProductRequest | null}
      />
    </ContentLayout>
  );
}
