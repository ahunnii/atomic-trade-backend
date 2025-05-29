import { getStoreIdViaTRPC } from "~/server/actions/store";

import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { SpecialRequestPageForm } from "../_components/special-request-page-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "Update Special Request Page" };

export default async function EditSpecialRequestPage({ params }: Props) {
  const { storeSlug } = await params;

  const storeId = await getStoreIdViaTRPC(storeSlug);

  const reservedPages = await api.reservedPage.get(storeSlug);

  return (
    <ContentLayout
      title="Update Special Request Page"
      breadcrumbs={[
        {
          href: `/${storeSlug}/pages/reserved`,
          label: "Reserved Pages",
        },
      ]}
      currentPage="Special Request Page"
      displayError={!reservedPages}
      displayErrorText="This reserved page does not exist."
      displayErrorActionHref={`/${storeSlug}/pages/reserved`}
      displayErrorActionLabel="Back to Reserved Pages"
    >
      <SpecialRequestPageForm
        initialData={reservedPages?.reservedSitePages ?? null}
        storeId={storeId}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
