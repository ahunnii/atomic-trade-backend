import type { Customer } from "~/types/customer";
import type { Order } from "~/types/order";
import type { ProductRequest } from "~/types/product-request";
import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { DraftOrderForm } from "../../_components/draft-order-form";

type Props = {
  params: Promise<{ storeSlug: string; orderId: string }>;
};

export const metadata = {
  title: "Edit Draft Order",
};

export default async function EditDraftOrderPage({ params }: Props) {
  const { storeSlug, orderId } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const order = await api.order.get(orderId);
  const products = await api.product.getAll({ storeId: store!.id });
  const customers = await api.customer.getAll(store!.id);
  const productRequest =
    order && order.productRequests.length > 0
      ? await api.productRequest.get(order.productRequests[0]!.id)
      : null;

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

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
        initialData={order as Order | null}
        storeId={store.id}
        storeSlug={storeSlug}
        customers={customers as Customer[]}
        products={products}
        productRequest={productRequest as ProductRequest | null}
      />
    </ContentLayout>
  );
}
