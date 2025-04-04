import { Navbar } from "~/components/layout/navbar";
import { cn } from "~/lib/utils";

type Props = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function ContentLayout({ title, children, className }: Props) {
  return (
    <div>
      <Navbar title={title} />
      <div className={cn("container px-4 pt-8 pb-8 sm:px-8", className)}>
        {children}
      </div>
    </div>
  );
}
