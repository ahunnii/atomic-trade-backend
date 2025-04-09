import { api } from "~/trpc/server";

import { AttributeForm } from "../_components/attributes-form";
import { ContentLayout } from "../../_components/content-layout";

type Props = {
  params: Promise<{ storeSlug: string }>;
};

export default async function NewAttributeAdminPage({ params }: Props) {
  const { storeSlug } = await params;
  const store = await api.store.getBySlug(storeSlug);

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <ContentLayout
      title="New Attribute"
      breadcrumbs={[
        {
          href: `/${storeSlug}/attributes`,
          label: "Attributes",
        },
      ]}
      currentPage="New Attribute"
    >
      <AttributeForm
        initialData={null}
        storeId={store.id}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
