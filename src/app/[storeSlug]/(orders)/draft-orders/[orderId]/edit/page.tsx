import { getStoreIdViaTRPC } from "~/server/actions/store";

import type { OrderWithOrderItems } from "~/types/order";
import type { ProductRequestWithCustomer } from "~/types/product-request";
import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { DraftOrderForm } from "../../_components/draft-order-form";

type Props = {
  params: Promise<{ storeSlug: string; orderId: string }>;
};

export const metadata = { title: "Edit Draft Order" };

export default async function EditDraftOrderPage({ params }: Props) {
  const { storeSlug, orderId } = await params;
  const storeId = await getStoreIdViaTRPC(storeSlug);
  const order = await api.order.get(orderId);
  const products = await api.product.getAll(storeSlug);
  const customers = await api.customer.getAll(storeSlug);
  const productRequest =
    order && order.productRequests.length > 0
      ? await api.productRequest.get(order.productRequests[0]!.id)
      : null;

  return (
    <ContentLayout
      title="Update Draft Order"
      breadcrumbs={[
        {
          href: `/${storeSlug}/draft-orders`,
          label: "Draft Orders",
        },
      ]}
      currentPage="Update Draft Order"
    >
      <DraftOrderForm
        initialData={order as OrderWithOrderItems | null}
        storeId={storeId}
        storeSlug={storeSlug}
        customers={customers}
        products={products}
        productRequest={productRequest as ProductRequestWithCustomer | null}
      />
    </ContentLayout>
  );
}
