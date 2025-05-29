import { getStoreIdViaTRPC } from "~/server/actions/store";

import type { ProductWithVariations } from "~/types/product";
import { api } from "~/trpc/server";

import { CollectionForm } from "../_components/collection-form";
import { ContentLayout } from "../../_components/content-layout";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "New Collection" };

export default async function NewCollectionAdminPage({ params }: Props) {
  const { storeSlug } = await params;

  const storeId = await getStoreIdViaTRPC(storeSlug);

  const products = await api.product.getAll(storeSlug);

  return (
    <ContentLayout
      title="New Collection"
      breadcrumbs={[
        {
          href: `/${storeSlug}/collections`,
          label: "Collections",
        },
      ]}
      currentPage="New Collection"
    >
      <CollectionForm
        initialData={null}
        products={products as ProductWithVariations[]}
        storeId={storeId}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
