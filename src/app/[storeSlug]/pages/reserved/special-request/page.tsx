import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { SpecialRequestPageForm } from "../_components/special-request-page-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Update Special Request Page",
};

export default async function EditSpecialRequestPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const reservedPages = await api.reservedPage.get(store?.id ?? "");

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

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
    >
      <SpecialRequestPageForm
        initialData={reservedPages?.reservedSitePages ?? null}
        storeId={store.id}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
