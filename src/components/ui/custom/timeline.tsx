"use client";

import type { VariantProps } from "class-variance-authority";
import type { HTMLMotionProps } from "framer-motion";
import * as React from "react";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, Pencil } from "lucide-react";

import type { TimelineColor } from "~/types/timeline";
import { cn } from "~/lib/utils";

const timelineVariants = cva("flex flex-col relative", {
  variants: {
    size: {
      sm: "gap-4",
      md: "gap-6",
      lg: "gap-8",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

/**
 * Timeline component props interface
 * @interface TimelineProps
 * @extends {React.HTMLAttributes<HTMLOListElement>}
 * @extends {VariantProps<typeof timelineVariants>}
 */
interface TimelineProps
  extends React.HTMLAttributes<HTMLOListElement>,
    VariantProps<typeof timelineVariants> {
  /** Size of the timeline icons */
  iconsize?: "sm" | "md" | "lg";
}

/**
 * Timeline component for displaying a vertical list of events or items
 * @component
 */
const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ className, iconsize, size, children, ...props }, ref) => {
    const items = React.Children.toArray(children);

    if (items.length === 0) {
      return <TimelineEmpty />;
    }

    return (
      <ol
        ref={ref}
        aria-label="Timeline"
        className={cn(
          timelineVariants({ size }),
          "relative mx-auto min-h-[600px] w-full max-w-2xl py-8",
          className,
        )}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (
            React.isValidElement(child) &&
            typeof child.type !== "string" &&
            "displayName" in child.type &&
            child.type.displayName === "TimelineItem"
          ) {
            return React.cloneElement(child, {
              iconsize,
              showConnector: index !== items.length - 1,
            } as React.ComponentProps<typeof TimelineItem>);
          }
          return child;
        })}
      </ol>
    );
  },
);
Timeline.displayName = "Timeline";

/**
 * TimelineItem component props interface
 * @interface TimelineItemProps
 * @extends {Omit<HTMLMotionProps<"li">, "ref">}
 */
interface TimelineItemProps extends Omit<HTMLMotionProps<"li">, "ref"> {
  /** Date string for the timeline item */
  date?: string;
  /** Title of the timeline item */
  title?: string;
  /** Description text */
  description?: string;
  /** Custom icon element */
  icon?: React.ReactNode;
  /** Color theme for the icon */
  iconColor?: TimelineColor;
  /** Current status of the item */
  status?: "completed" | "in-progress" | "pending";
  /** Color theme for the connector line */
  connectorColor?: TimelineColor;
  /** Whether to show the connector line */
  showConnector?: boolean;
  /** Size of the icon */
  iconsize?: "sm" | "md" | "lg";
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Whether the item is editable */
  isEditable?: boolean;
  /** Function to handle edit */
  onEdit?: () => void;
}

const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  (
    {
      className,
      date,
      title,
      description,
      icon,
      iconColor,
      status = "completed",
      connectorColor,
      showConnector = true,
      iconsize,
      loading,
      error,
      // Omit unused Framer Motion props
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      initial,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      animate,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      transition,
      isEditable = false,
      onEdit,
      ...props
    },
    ref,
  ) => {
    const commonClassName = cn("relative w-full mb-8 last:mb-0", className);

    // Loading State
    if (loading) {
      return (
        <motion.li
          ref={ref}
          className={commonClassName}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          role="status"
          {...props}
        >
          <div className="grid grid-cols-[minmax(auto,8rem)_auto_1fr] items-start px-4">
            <div className="pr-4 text-right">
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
            </div>

            <div className="mx-3 flex flex-col items-center justify-start gap-y-2">
              <div className="bg-muted ring-background relative flex h-8 w-8 animate-pulse items-center justify-center rounded-full ring-8">
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              </div>
              {showConnector && (
                <div className="bg-muted h-full w-0.5 animate-pulse" />
              )}
            </div>

            <div className="flex flex-col gap-2 pl-2">
              <div className="space-y-2">
                <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                <div className="bg-muted h-3 w-48 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </motion.li>
      );
    }

    // Error State
    if (error) {
      return (
        <motion.li
          ref={ref}
          className={cn(
            commonClassName,
            "border-destructive/50 bg-destructive/10 border",
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          role="alert"
          {...props}
        >
          <div className="grid grid-cols-[minmax(auto,8rem)_auto_1fr] items-start px-4">
            <div className="pr-4 text-right">
              <TimelineTime className="text-destructive">{date}</TimelineTime>
            </div>

            <div className="mx-3 flex flex-col items-center justify-start gap-y-2">
              <div className="bg-destructive/20 ring-background relative flex h-8 w-8 items-center justify-center rounded-full ring-8">
                <AlertCircle className="text-destructive h-4 w-4" />
              </div>
              {showConnector && (
                <TimelineConnector status="pending" className="h-full" />
              )}
            </div>

            <div className="flex flex-col gap-2 pl-2">
              <TimelineHeader>
                <TimelineTitle className="text-destructive">
                  {title ?? "Error"}
                </TimelineTitle>
              </TimelineHeader>
              <TimelineDescription className="text-destructive">
                {error}
              </TimelineDescription>
            </div>
          </div>
        </motion.li>
      );
    }

    const content = (
      <div
        className="grid grid-cols-[1fr_auto_1fr] items-start gap-4"
        {...(status === "in-progress" ? { "aria-current": "step" } : {})}
      >
        {/* Date */}
        <div className="flex flex-col justify-start pt-1">
          <TimelineTime className="pr-4 text-right">{date}</TimelineTime>
        </div>

        {/* Timeline dot and connector */}
        <div className="flex flex-col items-center">
          <div className="relative z-10">
            <TimelineIcon
              icon={icon}
              color={iconColor}
              status={status}
              iconSize={iconsize}
            />
          </div>
          {showConnector && <div className="bg-border mt-2 h-16 w-0.5" />}
        </div>

        {/* Content */}
        <TimelineContent className="group relative">
          <div className="flex items-start justify-between">
            <TimelineHeader>
              <TimelineTitle>{title}</TimelineTitle>
            </TimelineHeader>
            {isEditable && onEdit && (
              <button
                onClick={onEdit}
                className="text-muted-foreground hover:text-foreground group relative mt-1 ml-2 cursor-pointer"
                aria-label="Edit message"
              >
                <span className="bg-muted absolute -inset-x-2 -inset-y-2 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                <Pencil className="relative z-10 h-4 w-4" />
              </button>
            )}
          </div>
          <TimelineDescription>{description}</TimelineDescription>
        </TimelineContent>
      </div>
    );

    // Filter out Framer Motion specific props
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      style,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onDrag,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onDragStart,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onDragEnd,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onAnimationStart,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onAnimationComplete,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      transformTemplate,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      whileHover,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      whileTap,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      whileDrag,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      whileFocus,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      whileInView,
      ...filteredProps
    } = props;

    return (
      <li ref={ref} className={cn(commonClassName, "group")} {...filteredProps}>
        {content}
      </li>
    );
  },
);
TimelineItem.displayName = "TimelineItem";

interface TimelineTimeProps extends React.HTMLAttributes<HTMLTimeElement> {
  /** Date string, Date object, or timestamp */
  date?: string | Date | number;
  /** Optional format for displaying the date */
  format?: Intl.DateTimeFormatOptions;
}

const defaultDateFormat: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "2-digit",
};

const TimelineTime = React.forwardRef<HTMLTimeElement, TimelineTimeProps>(
  ({ className, date, format, children, ...props }, ref) => {
    const formattedDate = React.useMemo(() => {
      if (!date) return "";

      try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return "";

        return new Intl.DateTimeFormat("en-US", {
          ...defaultDateFormat,
          ...format,
        }).format(dateObj);
      } catch (error) {
        console.error("Error formatting date:", error);
        return "";
      }
    }, [date, format]);

    return (
      <time
        ref={ref}
        dateTime={date ? new Date(date).toISOString() : undefined}
        className={cn(
          "text-muted-foreground text-sm font-medium tracking-tight",
          className,
        )}
        {...props}
      >
        {children ?? formattedDate}
      </time>
    );
  },
);
TimelineTime.displayName = "TimelineTime";

const TimelineConnector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    status?: "completed" | "in-progress" | "pending";
    color?: "primary" | "secondary" | "muted" | "accent";
  }
>(({ className, status = "completed", color, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-0.5",
      {
        "bg-primary": color === "primary" || (!color && status === "completed"),
        "bg-muted": color === "muted" || (!color && status === "pending"),
        "bg-secondary": color === "secondary",
        "bg-accent": color === "accent",
        "from-primary to-muted bg-gradient-to-b":
          !color && status === "in-progress",
      },
      className,
    )}
    {...props}
  />
));
TimelineConnector.displayName = "TimelineConnector";

const TimelineHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-4", className)}
    {...props}
  />
));
TimelineHeader.displayName = "TimelineHeader";

const TimelineTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-secondary-foreground leading-none font-semibold tracking-tight",
      className,
    )}
    {...props}
  >
    {children}
  </h3>
));
TimelineTitle.displayName = "TimelineTitle";

const TimelineIcon = ({
  icon,
  color = "primary",
  status = "completed",
  iconSize = "md",
}: {
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "muted" | "accent" | "destructive";
  status?: "completed" | "in-progress" | "pending" | "error";
  iconSize?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const colorClasses = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    muted: "bg-muted text-muted-foreground",
    accent: "bg-accent text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground",
  };

  return (
    <div
      className={cn(
        "ring-background relative flex items-center justify-center rounded-full shadow-sm ring-8",
        sizeClasses[iconSize],
        colorClasses[color],
      )}
    >
      {icon ? (
        <div
          className={cn(
            "flex items-center justify-center",
            iconSizeClasses[iconSize],
          )}
        >
          {icon}
        </div>
      ) : (
        <div className={cn("rounded-full", iconSizeClasses[iconSize])} />
      )}
    </div>
  );
};

const TimelineDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-muted-foreground max-w-sm text-sm", className)}
    {...props}
  />
));
TimelineDescription.displayName = "TimelineDescription";

const TimelineContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-2 pl-2", className)}
    {...props}
  />
));
TimelineContent.displayName = "TimelineContent";

const TimelineEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      className,
    )}
    {...props}
  >
    <p className="text-muted-foreground text-sm">
      {children ?? "No timeline items to display"}
    </p>
  </div>
));
TimelineEmpty.displayName = "TimelineEmpty";

export {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineEmpty,
  TimelineHeader,
  TimelineIcon,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
};
