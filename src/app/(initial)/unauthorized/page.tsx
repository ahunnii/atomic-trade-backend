import Link from "next/link";

import { Button } from "~/components/ui/button";

export const metadata = {
  title: "Unauthorized",
};

export default function UnauthorizedPage() {
  return (
    <div className="centered-page my-auto">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold">Unauthorized</h1>
        <h2 className="mx-auto mb-4 max-w-4xl text-xl text-gray-600">
          It appears you are not authorized to access this page.
        </h2>
        <Link href="/contact-us">
          <Button>Contact Us</Button>
        </Link>
      </div>
    </div>
  );
}
