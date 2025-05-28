import { env } from "~/env";
import PlaceholderContent from "~/components/layout/placeholder-content";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

export default async function PaymentsPage() {
  return (
    <ContentLayout title="Payments">
      <PlaceholderContent />
    </ContentLayout>
  );
}
