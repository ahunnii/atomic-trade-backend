import { redirect } from "next/navigation";
import SidebarWrapper from "~/components/layout/sidebar-wrapper";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
}) {
  const session = await auth();
  const { storeSlug } = await params;

  if (!session || !session.user) {
    redirect(`/sign-in?redirect=${encodeURIComponent(`/stores/${storeSlug}`)}`);
  }

  if (session.user.role !== "ADMIN") {
    redirect(`/unauthorized`);
  }

  const store = await db.store.findUnique({
    where: { slug: storeSlug },
  });

  if (!store) {
    redirect(`/unauthorized`);
  }

  return <SidebarWrapper>{children}</SidebarWrapper>;
}
