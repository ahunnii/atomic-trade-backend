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
      // breadcrumbs={[
      //   {
      //     href: `/${storeSlug}/pages/reserved`,
      //     label: "Reserved Pages",
      //   },
      // ]}
      currentPage="Reserved Pages"
      // breadcrumbClassName="bg-background shadow p-4"
    >
      <div className="mt-4 mb-8 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Reserved Pages
        </h1>
        <p className="text-muted-foreground">
          Reserved pages are common store pages that most (if not all) stores
          would have. You can edit the basic content, enable, or disable them.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">About Page</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Manage your store&apos;s about page
          </p>
          <a
            href={`/${storeSlug}/pages/reserved/about`}
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
            href={`/${storeSlug}/pages/reserved/faq`}
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
            href={`/${storeSlug}/pages/reserved/contact`}
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
            href={`/${storeSlug}/pages/reserved/special-request`}
            className="text-primary text-sm font-medium hover:underline"
          >
            Edit Special Request Page →
          </a>
        </div>
      </div>
    </ContentLayout>
  );
}
