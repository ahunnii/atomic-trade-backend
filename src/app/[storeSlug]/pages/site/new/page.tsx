import { getStoreIdViaTRPC } from "~/server/actions/store";

import { api } from "~/trpc/server";

import { SitePageForm } from "../_components/site-page-form";
import { ContentLayout } from "../../../_components/content-layout";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "New Site Page" };

export default async function NewSitePageAdminPage({ params }: Props) {
  const { storeSlug } = await params;
  const storeId = await getStoreIdViaTRPC(storeSlug);
  const sitePages = await api.sitePage.getAll(storeSlug);

  return (
    <ContentLayout
      title="New Site Page"
      breadcrumbs={[
        {
          href: `/${storeSlug}/site-pages`,
          label: "Site Pages",
        },
      ]}
      currentPage="New Site Page"
    >
      <SitePageForm
        initialData={null}
        storeId={storeId}
        storeSlug={storeSlug}
        sitePages={sitePages}
      />
    </ContentLayout>
  );
}
