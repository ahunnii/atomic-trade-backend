import type { Customer } from "~/types/customer";
import type { Order } from "~/types/order";
import type { ProductRequest } from "~/types/product-request";
import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { DraftOrderForm } from "../../../draft-orders/_components/draft-order-form";

type Props = {
  params: Promise<{ storeSlug: string; orderId: string }>;
};

export const metadata = {
  title: "Update Order",
};

export default async function UpdateOrderPage({ params }: Props) {
  const { storeSlug, orderId } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const order = await api.order.get(orderId);

  const products = await api.product.getAll({ storeId: store!.id });
  const customers = await api.customer.getAll(store!.id);

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

  return (
    <ContentLayout
      title="Update Order"
      breadcrumbs={[
        {
          href: `/${storeSlug}/orders`,
          label: "Orders",
        },
      ]}
      currentPage="Update Order"
    >
      <DraftOrderForm
        initialData={order as Order | null}
        storeId={store.id}
        storeSlug={storeSlug}
        customers={customers as Customer[]}
        products={products}
        productRequest={null}
      />
    </ContentLayout>
  );
}
