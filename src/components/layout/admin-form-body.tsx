import type { FC } from "react";

import { cn } from "~/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export const AdminFormBody: FC<Props> = ({ children, className }) => {
  return (
    <section
      className={cn(
        "mt-4 flex w-full gap-4 space-y-8 p-8 max-lg:flex-col",
        className,
      )}
    >
      {children}
    </section>
  );
};
