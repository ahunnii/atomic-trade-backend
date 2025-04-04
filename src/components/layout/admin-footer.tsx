import Link from "next/link";

export function AdminFooter() {
  const supportEmail = "support@dreamwalkerstudios.co";
  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 z-20 w-full shadow backdrop-blur">
      <div className="mx-4 flex h-14 items-center md:mx-8">
        <p className="text-muted-foreground text-left text-xs leading-loose md:text-sm">
          Need help? Let us know at{" "}
          <Link
            href={`mailto:${supportEmail}`}
            className="font-medium underline underline-offset-4"
          >
            {supportEmail}
          </Link>
        </p>
      </div>
    </div>
  );
}
