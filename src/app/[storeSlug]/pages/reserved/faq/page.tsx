import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
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
  const store = await api.store.getBySlug(storeSlug);
  const reservedPages = await api.reservedPage.get(store?.id ?? "");

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

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
    >
      <FrequentlyAskedQuestionsPageForm
        initialData={reservedPages?.reservedSitePages ?? null}
        storeId={store.id}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
