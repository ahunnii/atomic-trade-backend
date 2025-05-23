import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Reserved Pages",
};

export default async function ReservedPagesPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

  return (
    <ContentLayout
      title="Reserved Pages"
      breadcrumbs={[
        {
          href: `/${storeSlug}/settings/reserved-pages`,
          label: "Reserved Pages",
        },
      ]}
      currentPage="Reserved Pages"
      // breadcrumbClassName="bg-background shadow p-4"
    >
      <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">About Page</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Manage your store&apos;s about page
          </p>
          <a
            href={`/${storeSlug}/settings/reserved-pages/about-page`}
            className="text-primary text-sm font-medium hover:underline"
          >
            Edit About Page →
          </a>
        </div>

        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">
            Frequently Asked Questions
          </h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Manage your store&apos;s frequently asked questions page
          </p>
          <a
            href={`/${storeSlug}/settings/reserved-pages/faq-page`}
            className="text-primary text-sm font-medium hover:underline"
          >
            Edit Frequently Asked Questions →
          </a>
        </div>

        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Contact Page</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Manage your store&apos;s contact page
          </p>
          <a
            href={`/${storeSlug}/settings/reserved-pages/contact-page`}
            className="text-primary text-sm font-medium hover:underline"
          >
            Edit Contact Page →
          </a>
        </div>

        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Special Request Page</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Manage your store&apos;s special request page
          </p>
          <a
            href={`/${storeSlug}/settings/reserved-pages/special-request-page`}
            className="text-primary text-sm font-medium hover:underline"
          >
            Edit Special Request Page →
          </a>
        </div>
      </div>
    </ContentLayout>
  );
}
