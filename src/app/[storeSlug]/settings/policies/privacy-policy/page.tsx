import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { PrivacyPolicyForm } from "../_components/privacy-policy-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Update Privacy Policy",
};

export default async function EditPrivacyPolicyPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const policies = await api.policy.get(store?.id ?? "");

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

  return (
    <ContentLayout
      title="Update Privacy Policy"
      breadcrumbs={[
        {
          href: `/${storeSlug}/settings/policies`,
          label: "Policies",
        },
      ]}
      currentPage="Privacy Policy"
    >
      <PrivacyPolicyForm
        initialData={policies?.sitePolicies ?? null}
        storeId={store.id}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
