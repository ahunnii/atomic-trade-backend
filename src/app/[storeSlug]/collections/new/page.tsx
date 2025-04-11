import { api } from "~/trpc/server";

import { CollectionForm } from "../_components/collection-form";
import { ContentLayout } from "../../_components/content-layout";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function NewCollectionAdminPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const products = await api.product.getAll({ storeId: store!.id });

  if (!store) {
    return <div>Store not found</div>;
  }

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
        products={products ?? []}
        storeId={store.id}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
