import type { StoreWithShipping } from "~/types/store";
import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { StoreShippingForm } from "./_components/store-shipping-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "Update Shipping" };

export default async function ShippingSettingsPage({ params }: Props) {
  const { storeSlug } = await params;

  const store = await api.store.getBySlug(storeSlug);

  return (
    <ContentLayout
      title="Shipping"
      breadcrumbs={[{ label: "Settings", href: `/${storeSlug}/settings` }]}
      currentPage="Shipping"
    >
      <StoreShippingForm
        initialData={store as StoreWithShipping}
        slug={storeSlug}
      />
    </ContentLayout>
  );
}
