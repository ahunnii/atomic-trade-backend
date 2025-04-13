import { api } from "~/trpc/server";

import { CustomerClient } from "./_components/customer-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Customers",
};

export default async function CustomersAdminPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  if (!store) {
    return <div>Store not found</div>;
  }

  return <CustomerClient storeId={store.id} storeSlug={storeSlug} />;
}
