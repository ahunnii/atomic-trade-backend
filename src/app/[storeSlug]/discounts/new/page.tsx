import type { DiscountType } from "@prisma/client";

import type { Collection } from "~/types/collection";
import type { Product } from "~/types/product";
import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { DiscountForm } from "../_components/discount-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ type: string }>;
};

export const metadata = {
  title: "New Discount",
  description: "Create a new discount",
};

export default async function NewDiscountAdminPage({
  params,
  searchParams,
}: Props) {
  const { storeSlug } = await params;
  const { type } = await searchParams;
  const store = await api.store.getBySlug(storeSlug);
  const products = await api.product.getAll({ storeId: store!.id });
  const collections = await api.collection.getAll(store!.id);

  if (!store) {
    return <div>Store not found</div>;
  }

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
        products={(products as unknown as Product[]) ?? []}
        storeId={store.id}
        storeSlug={storeSlug}
        type={type as DiscountType}
        collections={(collections as unknown as Collection[]) ?? []}
      />
    </ContentLayout>
  );
}
