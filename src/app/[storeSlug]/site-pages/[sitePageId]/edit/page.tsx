import type { SitePage } from "~/types/site-page";
import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { SitePageForm } from "../../_components/site-page-form";

type Props = {
  params: Promise<{ storeSlug: string; sitePageId: string }>;
};

export const metadata = {
  title: "Edit Site Page",
};

export default async function EditSitePagePage({ params }: Props) {
  const { storeSlug, sitePageId } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const sitePage = await api.sitePage.get(sitePageId);
  const sitePages = await api.sitePage.getAll(store?.id ?? "");

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

  return (
    <ContentLayout
      title="Update Site Page"
      breadcrumbs={[
        {
          href: `/${storeSlug}/site-pages`,
          label: "Site Pages",
        },
      ]}
      currentPage="Update Site Page"
      // breadcrumbClassName="bg-background shadow p-4"
    >
      <SitePageForm
        initialData={sitePage as SitePage | null}
        storeId={store.id}
        storeSlug={storeSlug}
        sitePages={sitePages as SitePage[]}
      />
    </ContentLayout>
  );
}
