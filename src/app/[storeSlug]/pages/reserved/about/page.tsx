import { getStoreIdViaTRPC } from "~/server/actions/store";

import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { AboutPageForm } from "../_components/about-page-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "Update About Page" };

export default async function EditAboutPage({ params }: Props) {
  const { storeSlug } = await params;

  const storeId = await getStoreIdViaTRPC(storeSlug);

  const reservedPages = await api.reservedPage.get(storeSlug);

  return (
    <ContentLayout
      title="Update About Page"
      breadcrumbs={[
        {
          href: `/${storeSlug}/pages/reserved`,
          label: "Reserved Pages",
        },
      ]}
      currentPage="About Page"
      displayError={!reservedPages}
      displayErrorText="This reserved page does not exist."
      displayErrorActionHref={`/${storeSlug}/pages/reserved`}
      displayErrorActionLabel="Back to Reserved Pages"
    >
      <AboutPageForm
        initialData={reservedPages?.reservedSitePages ?? null}
        storeId={storeId}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
