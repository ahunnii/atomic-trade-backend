import { api } from "~/trpc/server";

import { AttributeClient } from "./_components/attribute-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function AttributesPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);

  if (!store) {
    return <div>Store not found</div>;
  }

  return <AttributeClient storeId={store.id} storeSlug={storeSlug} />;
}
