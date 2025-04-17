import { api } from "~/trpc/server";

import { OrderForm } from "../_components/order-form";
import { ContentLayout } from "../../../_components/content-layout";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function NewOrderAdminPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const products = await api.product.getAll({ storeId: store!.id });
  const customers = await api.users.getAllCustomers(store!.id);

  if (!store) {
    return <div>Store not found</div>;
  }

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
        customers={customers ?? []}
        storeId={store.id}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
