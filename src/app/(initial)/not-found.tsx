import Link from "next/link";

import { Button } from "~/components/ui/button";

export const metadata = {
  title: "404 Not Found",
};

export default function NotFoundPage() {
  return (
    <div className="centered-page my-auto">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold">404 Not Found</h1>
        <h2 className="mx-auto mb-4 max-w-4xl text-xl text-gray-600">
          It appears that this page does not exist.
        </h2>
        <Link href="/contact-us">
          <Button>Contact Us</Button>
        </Link>
      </div>
    </div>
  );
}
