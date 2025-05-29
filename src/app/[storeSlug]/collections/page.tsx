import type { CollectionWithProducts } from "~/types/collection";
import { api } from "~/trpc/server";

import { ContentLayout } from "../_components/content-layout";
import { CollectionClient } from "./_components/collection-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "Collections" };

export default async function CollectionsAdminPage({ params }: Props) {
  const { storeSlug } = await params;

  const storeCollections = await api.collection.getAll(storeSlug);

  return (
    <ContentLayout title={`Collections (${storeCollections?.length ?? 0})`}>
      <CollectionClient
        storeSlug={storeSlug}
        collections={storeCollections as CollectionWithProducts[]}
      />
    </ContentLayout>
  );
}
