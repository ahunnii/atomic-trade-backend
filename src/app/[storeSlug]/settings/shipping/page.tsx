import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { StoreShippingForm } from "./_components/store-shipping-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Shipping",
  description: "Shipping settings for your store",
};

export default async function ShippingSettingsPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <ContentLayout
      title="Shipping"
      breadcrumbs={[{ label: "Settings", href: `/${storeSlug}/settings` }]}
      currentPage="Shipping"
    >
      <StoreShippingForm initialData={store} slug={storeSlug} />
    </ContentLayout>
  );
}
