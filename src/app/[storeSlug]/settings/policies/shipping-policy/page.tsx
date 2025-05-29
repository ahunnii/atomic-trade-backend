import { getStoreIdViaTRPC } from "~/server/actions/store";

import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { ShippingPolicyForm } from "../_components/shipping-policy-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Update Shipping Policy",
};

export default async function EditShippingPolicyPage({ params }: Props) {
  const { storeSlug } = await params;
  const storeId = await getStoreIdViaTRPC(storeSlug);
  const policies = await api.policy.get(storeSlug);

  return (
    <ContentLayout
      title="Update Shipping Policy"
      breadcrumbs={[
        {
          href: `/${storeSlug}/settings/policies`,
          label: "Policies",
        },
      ]}
      currentPage="Shipping Policy"
      displayError={!policies}
      displayErrorText="This store does not have a shipping policy."
      displayErrorActionHref={`/${storeSlug}/settings/policies`}
      displayErrorActionLabel="Back to Policies"
    >
      <ShippingPolicyForm
        initialData={policies?.sitePolicies ?? null}
        storeId={storeId}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
