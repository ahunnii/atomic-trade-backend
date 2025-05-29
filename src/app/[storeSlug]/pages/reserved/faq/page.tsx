import { getStoreIdViaTRPC } from "~/server/actions/store";

import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { FrequentlyAskedQuestionsPageForm } from "../_components/faq-page-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Update Frequently Asked Questions Page",
};

export default async function EditFrequentlyAskedQuestionsPage({
  params,
}: Props) {
  const { storeSlug } = await params;

  const storeId = await getStoreIdViaTRPC(storeSlug);

  const reservedPages = await api.reservedPage.get(storeSlug);

  return (
    <ContentLayout
      title="Update Frequently Asked Questions Page"
      breadcrumbs={[
        {
          href: `/${storeSlug}/pages/reserved`,
          label: "Reserved Pages",
        },
      ]}
      currentPage="Frequently Asked Questions Page"
      displayError={!reservedPages}
      displayErrorText="This reserved page does not exist."
      displayErrorActionHref={`/${storeSlug}/pages/reserved`}
      displayErrorActionLabel="Back to Reserved Pages"
    >
      <FrequentlyAskedQuestionsPageForm
        initialData={reservedPages?.reservedSitePages ?? null}
        storeId={storeId}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
