import { api } from "~/trpc/server";

import { ContentLayout } from "../../_components/content-layout";
import { SitePageClient } from "./_components/site-page-client";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "Site Pages" };

export default async function SitePagesAdminPage({ params }: Props) {
  const { storeSlug } = await params;

  const sitePages = await api.sitePage.getAll(storeSlug);

  return (
    <ContentLayout title={`Site Pages (${sitePages?.length ?? 0})`}>
      <SitePageClient sitePages={sitePages} storeSlug={storeSlug} />
    </ContentLayout>
  );
}
