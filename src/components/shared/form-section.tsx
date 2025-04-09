import { cn } from "~/lib/utils";
import { FormDescription, FormLabel } from "~/components/ui/form";

type Props = {
  children: React.ReactNode;
  title: string;
  description?: string;
  headerClassName?: string;
  bodyClassName?: string;
  hasError?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export const FormSection = ({
  children,
  title,
  description,
  className,
  headerClassName,
  bodyClassName,
  hasError,
}: Props) => {
  return (
    <div
      className={cn(
        "border-border bg-background/50 w-full rounded-md border p-4",
        className,
      )}
    >
      <div className={cn(headerClassName)}>
        <FormLabel className={cn("", hasError && "text-red-500")}>
          {title}
        </FormLabel>{" "}
        {description && <FormDescription>{description}</FormDescription>}
      </div>

      <div className={cn("mt-5", bodyClassName)}>{children}</div>
    </div>
  );
};
