"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { Button } from "../ui/button";

export const DataFetchErrorMessage = ({
  message = "An error occurred while loading the page.",
  actionHref,
  actionLabel = "Go Back",
}: {
  message?: string;
  actionHref?: string;
  actionLabel?: string;
}) => {
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100vh-56px)] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 rounded-lg border p-8 text-center shadow-lg">
        <AlertCircle className="text-destructive h-12 w-12" />
        <h2 className="text-foreground text-2xl font-semibold">
          Error Loading Data
        </h2>
        <p className="text-muted-foreground max-w-md text-lg">{message}</p>
        {actionHref ? (
          <Link
            href={actionHref}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded-md px-4 py-2"
          >
            {actionLabel}
          </Link>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground">
              Please contact your administrator for assistance.
            </p>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="hover:bg-primary/10 cursor-pointer"
            >
              Go Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
