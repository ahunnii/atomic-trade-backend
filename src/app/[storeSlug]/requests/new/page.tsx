import { getStoreIdViaTRPC } from "~/server/actions/store";

import { api } from "~/trpc/server";

import { ProductRequestForm } from "../_components/product-request-form";
import { ContentLayout } from "../../_components/content-layout";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "New Product Request" };

export default async function NewProductRequestAdminPage({ params }: Props) {
  const { storeSlug } = await params;
  const storeId = await getStoreIdViaTRPC(storeSlug);
  const customers = await api.customer.getAll(storeSlug);

  return (
    <ContentLayout
      title="New Product Request"
      breadcrumbs={[
        {
          href: `/${storeSlug}/requests`,
          label: "Product Requests",
        },
      ]}
      currentPage="New Product Request"
    >
      <ProductRequestForm
        initialData={null}
        storeId={storeId}
        storeSlug={storeSlug}
        customers={customers}
      />
    </ContentLayout>
  );
}
