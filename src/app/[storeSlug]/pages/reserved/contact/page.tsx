import { getStoreIdViaTRPC } from "~/server/actions/store";

import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { ContactPageForm } from "../_components/contact-page-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "Update Contact Page" };

export default async function EditContactPage({ params }: Props) {
  const { storeSlug } = await params;

  const storeId = await getStoreIdViaTRPC(storeSlug);

  const reservedPages = await api.reservedPage.get(storeSlug);

  return (
    <ContentLayout
      title="Update Contact Page"
      breadcrumbs={[
        {
          href: `/${storeSlug}/pages/reserved`,
          label: "Reserved Pages",
        },
      ]}
      currentPage="Contact Page"
      displayError={!reservedPages}
      displayErrorText="This reserved page does not exist."
      displayErrorActionHref={`/${storeSlug}/pages/reserved`}
      displayErrorActionLabel="Back to Reserved Pages"
    >
      <ContactPageForm
        initialData={reservedPages?.reservedSitePages ?? null}
        storeId={storeId}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
