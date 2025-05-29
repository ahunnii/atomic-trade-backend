import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Store Settings",
};

export default async function SettingsPage({ params }: Props) {
  const { storeSlug } = await params;

  return (
    <ContentLayout title="Store Settings" currentPage="Settings">
      <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Branding</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Customize your store&apos;s name, logo, and visual identity
          </p>
          <a
            href={`/${storeSlug}/settings/customization/branding`}
            className="text-primary text-sm font-medium hover:underline"
          >
            Edit Branding →
          </a>
        </div>

        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Homepage</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Configure your store&apos;s homepage layout and featured content
          </p>
          <a
            href={`/${storeSlug}/settings/customization/homepage`}
            className="text-primary text-sm font-medium hover:underline"
          >
            Edit Homepage →
          </a>
        </div>

        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Policies</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Manage your store&apos;s policies including privacy, terms, and
            refunds
          </p>
          <a
            href={`/${storeSlug}/settings/policies`}
            className="text-primary text-sm font-medium hover:underline"
          >
            Edit Policies →
          </a>
        </div>

        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Shipping</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Configure shipping methods, rates, and delivery options
          </p>
          <a
            href={`/${storeSlug}/settings/shipping`}
            className="text-primary text-sm font-medium hover:underline"
          >
            Edit Shipping →
          </a>
        </div>
      </div>
    </ContentLayout>
  );
}
