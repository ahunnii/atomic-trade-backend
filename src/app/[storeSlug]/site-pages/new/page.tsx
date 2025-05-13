import type { SitePage } from "~/types/site-page";
import { api } from "~/trpc/server";

import { SitePageForm } from "../_components/site-page-form";
import { ContentLayout } from "../../_components/content-layout";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function NewSitePageAdminPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const sitePages = await api.sitePage.getAll(store?.id ?? "");

  if (!store) {
    return <div>Store not found</div>;
  }

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
        storeId={store.id}
        storeSlug={storeSlug}
        sitePages={sitePages as SitePage[]}
      />
    </ContentLayout>
  );
}
