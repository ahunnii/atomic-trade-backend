import { api } from "~/trpc/server";

import { ContentLayout } from "../../../_components/content-layout";
import { DraftOrderForm } from "../../draft-orders/_components/draft-order-form";

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
      <DraftOrderForm
        initialData={null}
        products={products ?? []}
        customers={customers ?? []}
        storeId={store.id}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
