import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

import SidebarWrapper from "~/components/layout/sidebar-wrapper";

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
    redirect(
      `/sign-in?redirect=${encodeURIComponent(`/${storeSlug}/dashboard`)}`,
    );
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
