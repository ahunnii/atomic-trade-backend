import * as React from "react";
import { Pencil } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface TimelineItemProps extends React.HTMLAttributes<HTMLLIElement> {
  date?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  iconColor?: "primary" | "secondary" | "muted" | "accent";
  showConnector?: boolean;
  isEditable?: boolean;
  onEdit?: () => void;
}

export const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  (
    {
      className,
      date,
      title,
      description,
      icon,
      iconColor = "primary",
      showConnector = true,
      isEditable = false,
      onEdit,
      ...props
    },
    ref,
  ) => {
    return (
      <li
        ref={ref}
        className={cn("group relative mb-6 pl-6", className)}
        {...props}
      >
        {/* Connector Line */}
        {showConnector && (
          <div
            className={cn("absolute top-[24px] left-[7px] h-full w-[2px]", {
              "bg-primary": iconColor === "primary",
              "bg-secondary": iconColor === "secondary",
              "bg-muted": iconColor === "muted",
              "bg-accent": iconColor === "accent",
            })}
          />
        )}

        {/* Icon */}
        <div
          className={cn(
            "absolute top-1.5 left-0 flex h-4 w-4 items-center justify-center rounded-full",
            {
              "bg-primary text-primary-foreground": iconColor === "primary",
              "bg-secondary text-secondary-foreground":
                iconColor === "secondary",
              "bg-muted text-muted-foreground": iconColor === "muted",
              "bg-accent text-accent-foreground": iconColor === "accent",
            },
          )}
        >
          {icon && (
            <div className="flex h-2.5 w-2.5 items-center justify-center">
              {icon}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-muted-foreground text-sm">{date}</p>
            </div>

            {isEditable && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={onEdit}
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="sr-only">Edit message</span>
              </Button>
            )}
          </div>

          {description && (
            <div className="bg-card mt-2 rounded-lg border p-4">
              <p className="text-sm">{description}</p>
            </div>
          )}
        </div>
      </li>
    );
  },
);

TimelineItem.displayName = "TimelineItem";
