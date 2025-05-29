import { getStoreIdViaTRPC } from "~/server/actions/store";

import type { DiscountType } from "@prisma/client";

import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { DiscountForm } from "../_components/discount-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ type: string }>;
};

export const metadata = { title: "New Discount" };

export default async function NewDiscountAdminPage({
  params,
  searchParams,
}: Props) {
  const { storeSlug } = await params;
  const { type } = await searchParams;
  const storeId = await getStoreIdViaTRPC(storeSlug);

  const products = await api.product.getAll(storeSlug);
  const collections = await api.collection.getAll(storeSlug);

  return (
    <ContentLayout
      title="New Discount"
      breadcrumbs={[
        {
          href: `/${storeSlug}/discounts`,
          label: "Discounts",
        },
      ]}
      currentPage="New Discount"
    >
      <DiscountForm
        initialData={null}
        products={products ?? []}
        storeId={storeId}
        storeSlug={storeSlug}
        type={type as DiscountType}
        collections={collections ?? []}
      />
    </ContentLayout>
  );
}
