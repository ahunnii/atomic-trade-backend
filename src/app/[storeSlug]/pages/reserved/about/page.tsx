import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { AboutPageForm } from "../_components/about-page-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Update About Page",
};

export default async function EditPrivacyPolicyPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const reservedPages = await api.reservedPage.get(store?.id ?? "");

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

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
    >
      <AboutPageForm
        initialData={reservedPages?.reservedSitePages ?? null}
        storeId={store.id}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
