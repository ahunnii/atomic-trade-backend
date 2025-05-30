import { cn } from "~/lib/utils";

import { Card } from "../ui/card";

type Props = {
  title: string;
  children: React.ReactNode;
  ManageButton?: React.ReactNode;
  className?: string;
};

export const FormCardSection = ({
  children,
  title,
  ManageButton,
  className,
}: Props) => {
  return (
    <Card className={cn("px-6", className)}>
      <div className="space-y-6">
        <div className="space-y-4">
          <div
            className={cn(
              ManageButton && "mb-4 flex items-center justify-between",
            )}
          >
            <h2 className="text-lg font-medium">{title}</h2>
            {ManageButton}
          </div>
          {children}
        </div>
      </div>
    </Card>
  );
};
