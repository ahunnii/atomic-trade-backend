import { getStoreIdViaTRPC } from "~/server/actions/store";

import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { CollectionForm } from "../../_components/collection-form";

type Props = {
  params: Promise<{ storeSlug: string; collectionId: string }>;
};

export const metadata = { title: "Edit Collection" };

export default async function EditCollectionPage({ params }: Props) {
  const { collectionId, storeSlug } = await params;
  const storeId = await getStoreIdViaTRPC(storeSlug);

  const collection = await api.collection.get(collectionId);
  const products = await api.product.getAll(storeSlug);

  return (
    <ContentLayout
      title="Update Collection"
      breadcrumbs={[
        {
          href: `/${storeSlug}/collections`,
          label: "Collections",
        },
      ]}
      currentPage="Update Collection"
      displayError={!collection}
      displayErrorText="This collection does not exist."
      displayErrorActionHref={`/${storeSlug}/collections`}
      displayErrorActionLabel="Back to Collections"
    >
      <CollectionForm
        initialData={collection}
        products={products}
        storeId={storeId}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
