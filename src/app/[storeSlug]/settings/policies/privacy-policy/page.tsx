import { getStoreIdViaTRPC } from "~/server/actions/store";

import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { PrivacyPolicyForm } from "../_components/privacy-policy-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "Update Privacy Policy" };

export default async function EditPrivacyPolicyPage({ params }: Props) {
  const { storeSlug } = await params;
  const storeId = await getStoreIdViaTRPC(storeSlug);
  const policies = await api.policy.get(storeSlug);

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
      displayError={!policies}
      displayErrorText="This store does not have a privacy policy."
      displayErrorActionHref={`/${storeSlug}/settings/policies`}
      displayErrorActionLabel="Back to Policies"
    >
      <PrivacyPolicyForm
        initialData={policies?.sitePolicies ?? null}
        storeId={storeId}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
