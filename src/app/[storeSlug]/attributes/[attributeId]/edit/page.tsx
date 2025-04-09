import { api } from "~/trpc/server";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { AttributeForm } from "../../_components/attributes-form";

type Props = {
  params: Promise<{ storeSlug: string; attributeId: string }>;
};

export default async function EditAttributePage({ params }: Props) {
  const { storeSlug, attributeId } = await params;
  const attribute = await api.attribute.get(attributeId);
  const store = await api.store.getBySlug(storeSlug);

  if (!store) {
    return <DataFetchErrorMessage message="This store does not exist." />;
  }

  if (!attribute) {
    return (
      <DataFetchErrorMessage message="There seems to be an issue with loading the attribute." />
    );
  }

  return (
    <ContentLayout
      title="Update Attribute"
      breadcrumbs={[
        {
          href: `/${storeSlug}/attributes`,
          label: "Attributes",
        },
      ]}
      currentPage="Update Attribute"
      // breadcrumbClassName="bg-background shadow p-4"
    >
      <AttributeForm
        initialData={attribute}
        storeId={store.id}
        storeSlug={storeSlug}
      />
    </ContentLayout>
  );
}
