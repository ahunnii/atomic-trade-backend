import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

type Props = {
  link: string;

  title: string;
  children: React.ReactNode;
};
export const FormHeader = ({ title, children, link }: Props) => {
  return (
    <header className="sticky top-0 z-30 my-5 bg-white">
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between px-8 py-4",
        )}
      >
        <div>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={link}
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "h-7 w-7",
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>

              <h2 className="text-2xl font-bold tracking-tight capitalize">
                {title}
              </h2>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">{children}</div>
      </div>
      <Separator className="sticky top-32 z-30 shadow" />
    </header>
  );
};
