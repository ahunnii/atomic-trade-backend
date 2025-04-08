import { useState } from "react";
import type {
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { type Tag, TagInput } from "~/components/ui/tags/tag-input";
import { cn } from "~/lib/utils";

type Props<CurrentForm extends FieldValues> = {
  form: UseFormReturn<CurrentForm>;
  name: Path<CurrentForm>;
  defaultTags?: {
    id: string;
    name: string;
  }[];
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
};

export const TagFormField = <CurrentForm extends FieldValues>({
  form,
  name,
  defaultTags,
  disabled,
  label,
  description,
  className,
}: Props<CurrentForm>) => {
  const [tags, setTags] = useState<{ name: string; id: string }[]>(
    (defaultTags as Tag[]) ?? [],
  );

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn("col-span-full flex flex-col items-start", className)}
        >
          <FormLabel className="text-left">{label ?? "Tags"}</FormLabel>
          <FormControl>
            <TagInput
              {...field}
              placeholder="Enter a tag name and press enter."
              tags={tags}
              disabled={disabled}
              usePopoverForTags={false}
              className="w-full"
              setTags={(newTags) => {
                setTags(newTags);
                form.setValue(
                  name,
                  newTags as [Tag, ...Tag[]] as PathValue<
                    CurrentForm,
                    Path<CurrentForm>
                  >,
                );
                field.onChange(newTags);
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}

          <FormMessage />
        </FormItem>
      )}
    />
  );
};
