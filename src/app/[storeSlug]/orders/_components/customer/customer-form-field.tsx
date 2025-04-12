import type { UseFormReturn } from "react-hook-form";
import { useState } from "react";

import type { Option } from "~/components/ui/custom/autocomplete-input";
import type { ProductOrderFormData } from "~/lib/validators/order";
import { cn } from "~/lib/utils";
import { AutoComplete } from "~/components/ui/custom/autocomplete-input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

const FRAMEWORKS = [
  {
    value: "next.js",
    label: "Next.js",
    type: "framework",
    sublabel:
      "Next.js is a React framework for building server-side rendered (SSR) web applications.",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
    type: "framework",
    sublabel:
      "SvelteKit is a framework for building server-side rendered (SSR) web applications.",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
    type: "framework",
    sublabel:
      "Nuxt.js is a framework for building server-side rendered (SSR) web applications.",
  },
  {
    value: "remix",
    label: "Remix",
    type: "framework",
    sublabel:
      "Remix is a framework for building server-side rendered (SSR) web applications.",
  },
  {
    value: "astro",
    label: "Astro",
    type: "framework",
    sublabel:
      "Astro is a framework for building server-side rendered (SSR) web applications.",
  },
  {
    value: "wordpress",
    label: "WordPress",
    type: "framework",
    sublabel:
      "WordPress is a framework for building server-side rendered (SSR) web applications.",
  },
  {
    value: "express.js",
    label: "Express.js",
    type: "framework",
    sublabel:
      "Express.js is a framework for building server-side rendered (SSR) web applications.",
  },
  {
    value: "nest.js",
    label: "Nest.js",
    type: "framework",
    sublabel:
      "Nest.js is a framework for building server-side rendered (SSR) web applications.",
  },
];

type Props = {
  form: UseFormReturn<ProductOrderFormData>;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputId?: string;
  inputClassName?: string;
};

export function CustomerFormField({
  form,
  label,
  description,
  className,
  disabled,
  placeholder,
  onChange,
  onKeyDown,
  inputId,
  inputClassName,
}: Props) {
  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisbled] = useState(false);
  const [value, setValue] = useState<Option>();

  return (
    <FormField
      control={form.control}
      name="customer"
      render={({ field }) => (
        <FormItem className={cn("col-span-full", className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <AutoComplete
              options={FRAMEWORKS}
              emptyMessage="No results."
              placeholder="Find something"
              isLoading={isLoading}
              onValueChange={setValue}
              value={value}
              disabled={isDisabled}
              createButtonLabel="Create new"
              createIfNotFound={() => {
                console.log("createIfNotFound");
              }}
            />
            {/* <Input
              disabled={disabled}
              placeholder={placeholder ?? ""}
              {...field}
              onChange={(e) => {
                if (!!onChange) {
                  onChange(e.target.value);
                }
                field.onChange(e.target.value);
              }}
              onKeyDown={onKeyDown}
              id={inputId}
              className={inputClassName}
            /> */}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
