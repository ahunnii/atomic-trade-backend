import { cn } from "~/lib/utils";

import { Card } from "../ui/card";

type Props = {
  title: string;
  children: React.ReactNode;
  ManageButton?: React.ReactNode;
};

export const FormCardSection = ({ children, title, ManageButton }: Props) => {
  return (
    <Card className="px-6">
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
