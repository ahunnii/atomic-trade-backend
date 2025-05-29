import { api } from "~/trpc/server";

import { ContentLayout } from "../_components/content-layout";
import { DiscountClient } from "./_components/discount-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "Discounts" };

export default async function DiscountsAdminPage({ params }: Props) {
  const { storeSlug } = await params;

  const storeDiscounts = await api.discount.getAll(storeSlug);

  return (
    <ContentLayout title={`Discounts (${storeDiscounts?.length ?? 0})`}>
      <DiscountClient discounts={storeDiscounts} storeSlug={storeSlug} />
    </ContentLayout>
  );
}
