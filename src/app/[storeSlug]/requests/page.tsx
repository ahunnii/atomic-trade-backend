import { api } from "~/trpc/server";

import { ContentLayout } from "../_components/content-layout";
import { ProductRequestClient } from "./_components/product-request-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "Product Requests" };

export default async function ProductRequestsAdminPage({ params }: Props) {
  const { storeSlug } = await params;

  const storeRequests = await api.productRequest.getAll(storeSlug);

  return (
    <ContentLayout title={`Product Requests (${storeRequests?.length ?? 0})`}>
      <ProductRequestClient storeSlug={storeSlug} requests={storeRequests} />
    </ContentLayout>
  );
}
