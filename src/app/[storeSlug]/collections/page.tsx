import { api } from "~/trpc/server";

import { CollectionClient } from "./_components/collection-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Collections",
};

export default async function CollectionsAdminPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  if (!store) {
    return <div>Store not found</div>;
  }

  return <CollectionClient storeId={store.id} storeSlug={storeSlug} />;
}
