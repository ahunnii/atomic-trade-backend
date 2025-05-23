import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
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
  const store = await api.store.getBySlug(storeSlug);
  const policies = await api.policy.get(store?.id ?? "");

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

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
    >
      <ShippingPolicyForm
        initialData={policies?.sitePolicies ?? null}
        storeId={store.id}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
