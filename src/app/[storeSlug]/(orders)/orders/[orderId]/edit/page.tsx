import type { Customer } from "~/types/customer";
import type { Order } from "~/types/order";
import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { DraftOrderForm } from "../../../draft-orders/_components/draft-order-form";

type Props = {
  params: Promise<{ storeSlug: string; orderId: string }>;
};

export const metadata = {
  title: "Edit Customer",
};

export default async function EditCustomerPage({ params }: Props) {
  const { storeSlug, orderId } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const order = await api.order.get(orderId);
  //   const customer = order?.customerId
  //     ? await api.customer.get(order.customerId)
  //     : null;
  // //   const defaultAddress = customer?.addresses[0] ?? null;
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
        customers={customers}
        products={products}
      />
    </ContentLayout>
  );
}
