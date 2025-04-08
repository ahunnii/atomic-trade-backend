import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { WelcomeClient } from "./_components/welcome-client";

export const metadata = {
  title: "Welcome",
  description: "Welcome to Admin",
};

export default async function WelcomePage() {
  return <WelcomeClient />;
}
