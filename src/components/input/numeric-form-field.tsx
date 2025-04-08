import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { cn } from "~/lib/utils";
import { Input } from "../ui/input";

type Props<CurrentForm extends FieldValues> = {
  form: UseFormReturn<CurrentForm>;
  name: Path<CurrentForm>;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  prependSpan?: string;
  appendSpan?: string;
  min?: number;
  max?: number;
  appendClassName?: string;
  prependClassName?: string;
  onNumberChange?: (value: number) => void;
};

export const NumericFormField = <CurrentForm extends FieldValues>({
  form,
  name,
  label,
  description,
  className,
  disabled,
  placeholder,
  prependSpan,
  appendSpan,
  min,
  max,
  appendClassName,
  onNumberChange,
}: Props<CurrentForm>) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("col-span-full", className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div className="relative">
              {prependSpan && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">
                    {prependSpan}
                  </span>
                </div>
              )}

              <Input
                type="number"
                disabled={disabled}
                className={cn(
                  "block w-full rounded-md py-1.5 text-gray-900 sm:text-sm sm:leading-6",
                  prependSpan && "pl-7",
                  appendSpan && "pr-6",
                  appendSpan && appendSpan.length > 2 && "pr-12",
                )}
                min={prependSpan === "$" ? "0.01" : "0"}
                step={prependSpan === "$" ? "0.01" : "1"}
                placeholder={placeholder ?? "0"}
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  if (onNumberChange) {
                    const value = parseInt(e.target.value);
                    onNumberChange(value);
                  }
                }}
              />

              {appendSpan && (
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <span
                    className={cn(
                      "py-0 pr-3 pl-2 text-gray-500 sm:text-sm",
                      appendClassName,
                    )}
                  >
                    {appendSpan}
                  </span>
                </div>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
