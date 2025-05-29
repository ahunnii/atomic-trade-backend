import { getStoreIdViaTRPC } from "~/server/actions/store";

import { CustomerForm } from "../_components/customer-form";
import { ContentLayout } from "../../_components/content-layout";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "New Customer" };

export default async function NewCustomerAdminPage({ params }: Props) {
  const { storeSlug } = await params;
  const storeId = await getStoreIdViaTRPC(storeSlug);

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
        storeId={storeId}
        storeSlug={storeSlug}
        defaultAddress={null}
      />
    </ContentLayout>
  );
}
