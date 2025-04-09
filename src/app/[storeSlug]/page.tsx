import { redirect } from "next/navigation";

export default async function StorePage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;

  redirect(`/${storeSlug}/dashboard`);
}
