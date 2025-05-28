import { api } from "~/trpc/server";
import PlaceholderContent from "~/components/layout/placeholder-content";
import { FormCardSection } from "~/components/shared/form-card-section";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { DiscountClient } from "../_components/discount-client";
import { CheckoutSessionClient } from "../../payments/_components/checkout-session-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function PaymentsCheckoutPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <ContentLayout
      title="Checkout"
      breadcrumbs={[
        { label: "Payments", href: `/${storeSlug}/settings/payments` },
        {
          label: "Discounts",
          href: `/${storeSlug}/settings/payments/discounts`,
        },
      ]}
      currentPage="Discounts"
    >
      <div className="my-4 space-y-4">
        <DiscountClient storeId={store.id} storeSlug={storeSlug} />
      </div>
    </ContentLayout>
  );
}
