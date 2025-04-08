import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { cn } from "~/lib/utils";

import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

type Props = {
  link: string;
  contentName: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};
export const AdminFormHeader = ({
  title,
  contentName,
  description,
  link,
  children,
  className,
}: Props) => {
  return (
    <header className="sticky top-0 z-30 mt-5 bg-white">
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between px-8 py-4",
          className,
        )}
      >
        <div>
          {/* <BackToButton link={link} title={`Back to ${contentName}`} /> */}
          <Heading title={title} description={description ?? ""} />
        </div>
        <div className="flex items-center gap-2">{children}</div>
      </div>
      <Separator className="sticky top-32 z-30 shadow" />
    </header>
  );
};

const Heading = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight capitalize">{title}</h2>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

const BackToButton = ({ link, title }: { link: string; title?: string }) => {
  return (
    <Link href={link}>
      <Button className="flex px-0 text-sm text-zinc-500" variant={"link"}>
        <ArrowLeft className="h-6 w-6" /> {title ?? "Go back"}
      </Button>
    </Link>
  );
};
