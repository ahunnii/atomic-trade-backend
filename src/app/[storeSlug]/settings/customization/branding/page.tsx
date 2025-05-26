import { api } from "~/trpc/server";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { BrandingForm } from "./_components/branding-form";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata = {
  title: "Branding",
  description: "Branding settings for your store",
};

export default async function BrandingSettingsPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <ContentLayout
      title="Branding"
      breadcrumbs={[{ label: "Settings", href: `/${storeSlug}/settings` }]}
      currentPage="Branding"
    >
      <BrandingForm initialData={store} slug={storeSlug} />
    </ContentLayout>
  );
}
