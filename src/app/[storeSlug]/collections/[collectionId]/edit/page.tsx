import type { Collection } from "~/types/collection";
import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { CollectionForm } from "../../_components/collection-form";

type Props = {
  params: Promise<{ storeSlug: string; collectionId: string }>;
};

export default async function EditCollectionPage({ params }: Props) {
  const { storeSlug, collectionId } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const collection = await api.collection.get(collectionId);
  const products = await api.product.getAll({ storeId: store!.id });

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

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
      // breadcrumbClassName="bg-background shadow p-4"
    >
      <CollectionForm
        initialData={collection as Collection | null}
        products={products ?? []}
        storeId={store.id}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
