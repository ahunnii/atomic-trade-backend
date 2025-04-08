import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

type Props<CurrentForm extends FieldValues> = {
  form: UseFormReturn<CurrentForm>;
  name: Path<CurrentForm>;
  label: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  badgeText?: string;
  badgeClassName?: string;
};

export const SingleCheckboxFormField = <CurrentForm extends FieldValues>({
  form,
  name,
  label,
  description,
  className,
  disabled,
  badgeText,
  badgeClassName,
}: Props<CurrentForm>) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "col-span-full flex flex-row items-start space-y-0 space-x-3 rounded-md border bg-white p-4",
            className,
          )}
        >
          <FormControl>
            <Checkbox
              checked={field.value}
              disabled={disabled}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className="flex items-center justify-between">
              {label}{" "}
              {badgeText && (
                <Badge className={cn(badgeClassName)}>{badgeText}</Badge>
              )}
            </FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};
