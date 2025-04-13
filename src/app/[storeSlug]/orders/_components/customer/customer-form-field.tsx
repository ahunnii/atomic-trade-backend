import type { UseFormReturn } from "react-hook-form";
import { useMemo, useState } from "react";

import type { Option } from "~/components/ui/custom/autocomplete-input";
import type { ProductOrderFormData } from "~/lib/validators/order";
import type { Customer } from "~/types/customer";
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
  customers: Customer[];
};

export function CustomerFormField({
  form,
  label,
  description,
  className,
  customers,
  disabled,
  placeholder,
  onChange,
  onKeyDown,
  inputId,
  inputClassName,
}: Props) {
  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisbled] = useState(false);
  const [value, setValue] = useState<Option<Customer>>();

  const formattedCustomers = useMemo(() => {
    return customers.map((customer) => ({
      value: customer.id,
      label: `${customer.firstName} ${customer.lastName}`,
      sublabel: customer.email,
      data: customer,
    })) as Option<Customer>[];
  }, [customers]);

  return (
    <FormField
      control={form.control}
      name="customer"
      render={({ field }) => (
        <FormItem className={cn("col-span-full", className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <AutoComplete
              options={formattedCustomers ?? []}
              emptyMessage="No results."
              placeholder="Find something"
              isLoading={isLoading}
              onValueChange={(value) => {
                console.log(value);
                setValue(value);

                const address =
                  value.data.addresses.find((address) => address.isDefault) ??
                  value.data.addresses[0];

                form.setValue("customer.firstName", value.data.firstName);
                form.setValue("customer.lastName", value.data.lastName);
                form.setValue("customer.email", value.data.email);
                form.setValue("customer.phone", value.data.phone ?? undefined);
                form.setValue("customer.shippingAddress", address ?? undefined);
                form.setValue("customer.billingAddress", address ?? undefined);
                form.setValue("customer.id", value.data.id);
              }}
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
