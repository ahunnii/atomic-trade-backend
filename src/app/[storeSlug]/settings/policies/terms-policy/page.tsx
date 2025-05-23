import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { TermsPolicyForm } from "../_components/terms-policy-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Update Terms of Service",
};

export default async function EditTermsPolicyPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const policies = await api.policy.get(store?.id ?? "");

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

  return (
    <ContentLayout
      title="Update Terms of Service"
      breadcrumbs={[
        {
          href: `/${storeSlug}/settings/policies`,
          label: "Policies",
        },
      ]}
      currentPage="Terms of Service"
    >
      <TermsPolicyForm
        initialData={policies?.sitePolicies ?? null}
        storeId={store.id}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
