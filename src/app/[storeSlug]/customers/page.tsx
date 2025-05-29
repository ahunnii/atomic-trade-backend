import type { CustomerWithOrders } from "~/types/customer";
import { api } from "~/trpc/server";

import { ContentLayout } from "../_components/content-layout";
import { CustomerClient } from "./_components/customer-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "Customers" };

export default async function CustomersAdminPage({ params }: Props) {
  const { storeSlug } = await params;

  const storeCustomers = await api.customer.getAll(storeSlug);

  return (
    <ContentLayout title={`Customers (${storeCustomers?.length ?? 0})`}>
      <CustomerClient
        storeSlug={storeSlug}
        customers={storeCustomers as CustomerWithOrders[]}
      />
    </ContentLayout>
  );
}
