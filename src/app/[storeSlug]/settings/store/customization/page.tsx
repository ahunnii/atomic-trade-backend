import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { HomepageCustomizationForm } from "./_components/homepage-customization-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Customization",
  description: "Customization settings for your store",
};

export default async function BrandingSettingsPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);
  const homepageSettings = await api.store.getHomepageSettings(store?.id ?? "");

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <ContentLayout
      title="Branding"
      breadcrumbs={[{ label: "Settings", href: `/${storeSlug}/settings` }]}
      currentPage="Branding"
    >
      <HomepageCustomizationForm
        initialData={homepageSettings ?? null}
        storeId={store.id}
        slug={storeSlug}
      />
    </ContentLayout>
  );
}
