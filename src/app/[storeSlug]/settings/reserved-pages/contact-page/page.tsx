import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { ContactPageForm } from "../_components/contact-page-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Update Contact Page",
};

export default async function EditContactPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const reservedPages = await api.reservedPage.get(store?.id ?? "");

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

  return (
    <ContentLayout
      title="Update Contact Page"
      breadcrumbs={[
        {
          href: `/${storeSlug}/settings/reserved-pages`,
          label: "Reserved Pages",
        },
      ]}
      currentPage="Contact Page"
    >
      <ContactPageForm
        initialData={reservedPages?.reservedSitePages ?? null}
        storeId={store.id}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
