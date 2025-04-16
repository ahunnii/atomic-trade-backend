import type { Tag } from "emblor";
import type {
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
import { useState } from "react";
import { TagInput } from "emblor";

import { cn } from "~/lib/utils";
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
  defaultTags?: Tag[];
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
  const [tags, setTags] = useState<Tag[]>(defaultTags ?? []);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn("col-span-full flex flex-col items-start", className)}
        >
          {label && <FormLabel className="text-left">{label}</FormLabel>}
          <FormControl>
            <TagInput
              {...field}
              disabled={disabled}
              styleClasses={{ input: "h-9" }}
              placeholder="Enter a tag, press enter to add"
              tags={tags}
              setTags={(newTags) => {
                setTags(newTags);
                form.setValue(
                  name,
                  newTags as [Tag, ...Tag[]] as PathValue<
                    CurrentForm,
                    Path<CurrentForm>
                  >,
                );
              }}
              activeTagIndex={activeTagIndex}
              setActiveTagIndex={setActiveTagIndex}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}

          <FormMessage />
        </FormItem>
      )}
    />
  );
};
