import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { RefundPolicyForm } from "../_components/refund-policy-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Update Refund Policy",
};

export default async function EditRefundPolicyPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const policies = await api.policy.get(store?.id ?? "");

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

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
    >
      <RefundPolicyForm
        initialData={policies?.sitePolicies ?? null}
        storeId={store.id}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
