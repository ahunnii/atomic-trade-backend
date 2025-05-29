import { getStoreIdViaTRPC } from "~/server/actions/store";

import type { DiscountWithProducts } from "~/types/discount";
import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { DiscountForm } from "../../_components/discount-form";

type Props = {
  params: Promise<{ storeSlug: string; discountId: string }>;
  searchParams: Promise<{ type: string }>;
};

export const metadata = { title: "Edit Discount" };

export default async function EditDiscountPage({ params }: Props) {
  const { storeSlug, discountId } = await params;
  const storeId = await getStoreIdViaTRPC(storeSlug);

  const discount = await api.discount.get(discountId);
  const collections = await api.collection.getAll(storeSlug);
  const products = await api.product.getAll(storeSlug);

  return (
    <ContentLayout
      title="Update Discount"
      breadcrumbs={[
        {
          href: `/${storeSlug}/discounts`,
          label: "Discounts",
        },
      ]}
      currentPage="Update Discount"
      displayError={!discount}
      displayErrorText="This discount does not exist."
      displayErrorActionHref={`/${storeSlug}/discounts`}
      displayErrorActionLabel="Back to Discounts"
    >
      <DiscountForm
        initialData={discount as DiscountWithProducts | null}
        products={products ?? []}
        storeId={storeId}
        storeSlug={storeSlug}
        collections={collections}
        type={discount!.type}
      />
    </ContentLayout>
  );
}
