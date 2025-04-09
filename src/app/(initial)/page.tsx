import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

import { api } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    if (session?.user.role !== "ADMIN") {
      void redirect("/unauthorized");
    }

    const store = await api.store.getFirst();

    if (store) {
      void redirect(`/${store.slug}/dashboard`);
    } else {
      void redirect(`/welcome`);
    }
  } else {
    void redirect("/sign-in");
  }
}
