import type { Customer } from "~/types/customer";
import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { CustomerForm } from "../../_components/customer-form";

type Props = {
  params: Promise<{ storeSlug: string; customerId: string }>;
};

export const metadata = {
  title: "Edit Customer",
};

export default async function EditCustomerPage({ params }: Props) {
  const { storeSlug, customerId } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const customer = await api.customer.get(customerId);
  const defaultAddress = customer?.addresses[0] ?? null;

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

  return (
    <ContentLayout
      title="Update Customer"
      breadcrumbs={[
        {
          href: `/${storeSlug}/customers`,
          label: "Customers",
        },
      ]}
      currentPage="Update Customer"
    >
      <CustomerForm
        initialData={customer as Customer | null}
        storeId={store.id}
        storeSlug={storeSlug}
        defaultAddress={defaultAddress}
      />
    </ContentLayout>
  );
}
