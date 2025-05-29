import { getStoreIdViaTRPC } from "~/server/actions/store";

import type { CustomerWithOrders } from "~/types/customer";
import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { CustomerForm } from "../../_components/customer-form";

type Props = {
  params: Promise<{ storeSlug: string; customerId: string }>;
};

export const metadata = { title: "Edit Customer" };

export default async function EditCustomerPage({ params }: Props) {
  const { customerId, storeSlug } = await params;
  const storeId = await getStoreIdViaTRPC(storeSlug);

  const customer = await api.customer.get(customerId);
  const defaultAddress = customer?.addresses[0] ?? null;

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
      displayError={!customer}
      displayErrorText="This customer does not exist."
      displayErrorActionHref={`/${storeSlug}/customers`}
      displayErrorActionLabel="Back to Customers"
    >
      <CustomerForm
        initialData={customer as CustomerWithOrders}
        storeId={storeId}
        storeSlug={storeSlug}
        defaultAddress={defaultAddress}
      />
    </ContentLayout>
  );
}
