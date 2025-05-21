import type { DiscountType } from "@prisma/client";

import type { Collection } from "~/types/collection";
import type { Discount } from "~/types/discount";
import type { Product } from "~/types/product";
import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { DiscountForm } from "../../_components/discount-form";

type Props = {
  params: Promise<{ storeSlug: string; discountId: string }>;
  searchParams: Promise<{ type: string }>;
};

export const metadata = {
  title: "Edit Discount",
};

export default async function EditDiscountPage({
  params,
  searchParams,
}: Props) {
  const { storeSlug, discountId } = await params;
  const { type } = await searchParams;
  const store = await api.store.getBySlug(storeSlug);
  const discount = await api.discount.get(discountId);
  const collections = await api.collection.getAll(store!.id);
  const products = await api.product.getAll({ storeId: store!.id });

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

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
    >
      <DiscountForm
        initialData={discount as Discount | null}
        products={(products as unknown as Product[]) ?? []}
        storeId={store.id}
        storeSlug={storeSlug}
        collections={collections as Collection[]}
        type={discount!.type}
      />
    </ContentLayout>
  );
}
