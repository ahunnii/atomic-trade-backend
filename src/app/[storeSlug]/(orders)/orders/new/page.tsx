import { getStoreIdViaTRPC } from "~/server/actions/store";

import { api } from "~/trpc/server";

import { OrderForm } from "../_components/order-form";
import { ContentLayout } from "../../../_components/content-layout";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "New Order" };

export default async function NewOrderAdminPage({ params }: Props) {
  const { storeSlug } = await params;
  const storeId = await getStoreIdViaTRPC(storeSlug);
  const products = await api.product.getAll(storeSlug);
  const customers = await api.customer.getAll(storeSlug);

  return (
    <ContentLayout
      title="New Order"
      breadcrumbs={[
        {
          href: `/${storeSlug}/orders`,
          label: "Orders",
        },
      ]}
      currentPage="New Order"
    >
      <OrderForm
        initialData={null}
        products={products ?? []}
        customers={customers}
        storeId={storeId}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
