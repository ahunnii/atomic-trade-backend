import { getStoreIdViaTRPC } from "~/server/actions/store";

import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { SitePageForm } from "../../_components/site-page-form";

type Props = {
  params: Promise<{ storeSlug: string; sitePageId: string }>;
};

export const metadata = { title: "Edit Site Page" };

export default async function EditSitePagePage({ params }: Props) {
  const { storeSlug, sitePageId } = await params;
  const storeId = await getStoreIdViaTRPC(storeSlug);
  const sitePage = await api.sitePage.get(sitePageId);
  const sitePages = await api.sitePage.getAll(storeSlug);

  return (
    <ContentLayout
      title="Update Site Page"
      breadcrumbs={[
        {
          href: `/${storeSlug}/pages/site`,
          label: "Site Pages",
        },
      ]}
      currentPage="Update Site Page"
      displayError={!sitePage}
      displayErrorText="This site page does not exist."
      displayErrorActionHref={`/${storeSlug}/pages/site`}
      displayErrorActionLabel="Back to Site Pages"
    >
      <SitePageForm
        initialData={sitePage}
        storeId={storeId}
        storeSlug={storeSlug}
        sitePages={sitePages}
      />
    </ContentLayout>
  );
}
