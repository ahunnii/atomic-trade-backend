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
import MarkdownEditor from "../ui/markdown/markdown-editor";

type Props<CurrentForm extends FieldValues> = {
  form: UseFormReturn<CurrentForm>;
  name: Path<CurrentForm>;
  label: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  overrideText?: string;
  overrideBtnText?: string;
  enableClear?: boolean;
  markdownClassName?: string;
};

export const MarkdownFormField = <CurrentForm extends FieldValues>({
  form,
  name,
  label,
  description,
  className,
  disabled,
  overrideText,
  overrideBtnText,
  enableClear,
  markdownClassName,
}: Props<CurrentForm>) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("col-span-full", className)}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <MarkdownEditor
              description={field.value}
              onChange={field.onChange}
              enableClear={enableClear}
              enableOverride={overrideText ?? undefined}
              overrideBtnText={overrideBtnText ?? undefined}
              className={markdownClassName}
              disabled={disabled}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
