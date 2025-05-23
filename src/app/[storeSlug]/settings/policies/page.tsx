import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Update Policies",
};

export default async function EditPoliciesPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const policies = await api.policy.get(store?.id ?? "");

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

  return (
    <ContentLayout
      title="Update Policies"
      breadcrumbs={[
        {
          href: `/${storeSlug}/settings/policies`,
          label: "Policies",
        },
      ]}
      currentPage="Policies"
      // breadcrumbClassName="bg-background shadow p-4"
    >
      <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Privacy Policy</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Manage your store&apos;s privacy policy and data handling practices
          </p>
          <a
            href={`/${storeSlug}/settings/policies/privacy-policy`}
            className="text-primary text-sm font-medium hover:underline"
          >
            Edit Privacy Policy →
          </a>
        </div>

        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Terms of Service</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Set the terms and conditions for using your store
          </p>
          <a
            href={`/${storeSlug}/settings/policies/terms-policy`}
            className="text-primary text-sm font-medium hover:underline"
          >
            Edit Terms of Service →
          </a>
        </div>

        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Refund Policy</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Define your store&apos;s refund and return policies
          </p>
          <a
            href={`/${storeSlug}/settings/policies/refund-policy`}
            className="text-primary text-sm font-medium hover:underline"
          >
            Edit Refund Policy →
          </a>
        </div>

        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Shipping Policy</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Outline your shipping methods, costs, and delivery times
          </p>
          <a
            href={`/${storeSlug}/settings/policies/shipping-policy`}
            className="text-primary text-sm font-medium hover:underline"
          >
            Edit Shipping Policy →
          </a>
        </div>
      </div>
    </ContentLayout>
  );
}
