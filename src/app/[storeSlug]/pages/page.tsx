import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Pages",
};

export default async function PagesPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

  return (
    <ContentLayout title="Pages" currentPage="Pages">
      <div className="mt-4 mb-8 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Pages</h1>
        <p className="text-muted-foreground">
          Manage your store&apos;s pages. You can edit reserved pages or create
          custom site pages.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Reserved Pages</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Manage common store pages like About, Contact, FAQ, and Special
            Requests
          </p>
          <a
            href={`/${storeSlug}/pages/reserved`}
            className="text-primary text-sm font-medium hover:underline"
          >
            Manage Reserved Pages →
          </a>
        </div>

        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Site Pages</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Create and manage custom pages for your store
          </p>
          <a
            href={`/${storeSlug}/pages/site`}
            className="text-primary text-sm font-medium hover:underline"
          >
            Manage Site Pages →
          </a>
        </div>
      </div>
    </ContentLayout>
  );
}
