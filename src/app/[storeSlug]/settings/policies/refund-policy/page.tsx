import { getStoreIdViaTRPC } from "~/server/actions/store";

import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { RefundPolicyForm } from "../_components/refund-policy-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = { title: "Update Refund Policy" };

export default async function EditRefundPolicyPage({ params }: Props) {
  const { storeSlug } = await params;
  const storeId = await getStoreIdViaTRPC(storeSlug);
  const policies = await api.policy.get(storeSlug);

  return (
    <ContentLayout
      title="Update Refund Policy"
      breadcrumbs={[
        {
          href: `/${storeSlug}/settings/policies`,
          label: "Policies",
        },
      ]}
      currentPage="Refund Policy"
      displayError={!policies}
      displayErrorText="This store does not have a refund policy."
      displayErrorActionHref={`/${storeSlug}/settings/policies`}
      displayErrorActionLabel="Back to Policies"
    >
      <RefundPolicyForm
        initialData={policies?.sitePolicies ?? null}
        storeId={storeId}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
