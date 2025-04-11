import { api } from "~/trpc/server";

import { ProductForm } from "../_components/product-form";
import { ContentLayout } from "../../_components/content-layout";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function NewProductAdminPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const attributes = await api.attribute.getAll(store!.id);

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <ContentLayout
      title="New Product"
      breadcrumbs={[
        {
          href: `/${storeSlug}/products`,
          label: "Products",
        },
      ]}
      currentPage="New Product"
    >
      <ProductForm
        initialData={null}
        attributes={attributes ?? []}
        storeId={store.id}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
