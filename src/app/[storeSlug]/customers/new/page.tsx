import { api } from "~/trpc/server";

import { CustomerForm } from "../_components/customer-form";
import { ContentLayout } from "../../_components/content-layout";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function NewCollectionAdminPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <ContentLayout
      title="New Customer"
      breadcrumbs={[
        {
          href: `/${storeSlug}/customers`,
          label: "Customers",
        },
      ]}
      currentPage="New Customer"
    >
      <CustomerForm
        initialData={null}
        storeId={store.id}
        storeSlug={storeSlug}
        defaultAddress={null}
      />
    </ContentLayout>
  );
}
