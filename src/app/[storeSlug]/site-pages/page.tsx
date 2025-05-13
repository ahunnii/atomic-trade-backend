import { api } from "~/trpc/server";

import { SitePageClient } from "./_components/site-page-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Site Pages",
};

export default async function SitePagesAdminPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  if (!store) {
    return <div>Store not found</div>;
  }

  return <SitePageClient storeId={store.id} storeSlug={storeSlug} />;
}
