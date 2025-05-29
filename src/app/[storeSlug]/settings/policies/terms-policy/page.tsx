import { getStoreIdViaTRPC } from "~/server/actions/store";

import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { TermsPolicyForm } from "../_components/terms-policy-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "Update Terms of Service" };

export default async function EditTermsPolicyPage({ params }: Props) {
  const { storeSlug } = await params;
  const storeId = await getStoreIdViaTRPC(storeSlug);
  const policies = await api.policy.get(storeSlug);

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
      displayError={!policies}
      displayErrorText="This store does not have a terms of service."
      displayErrorActionHref={`/${storeSlug}/settings/policies`}
      displayErrorActionLabel="Back to Policies"
    >
      <TermsPolicyForm
        initialData={policies?.sitePolicies ?? null}
        storeId={storeId}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
