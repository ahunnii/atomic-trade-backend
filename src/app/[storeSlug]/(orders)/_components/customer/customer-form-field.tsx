import type { UseFormReturn } from "react-hook-form";
import { useMemo, useState } from "react";

import type { Option } from "~/components/ui/custom/autocomplete-input";
import type { DraftOrderFormData } from "~/lib/validators/order";
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

type Props = {
  form: UseFormReturn<DraftOrderFormData>;
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
}: Props) {
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
      render={({}) => (
        <FormItem className={cn("col-span-full", className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <AutoComplete
              options={formattedCustomers ?? []}
              emptyMessage="No results."
              placeholder="Search for a customer..."
              isLoading={false}
              onValueChange={(value) => {
                setValue(value);

                const address =
                  value.data.addresses.find((address) => address.isDefault) ??
                  value.data.addresses[0];

                console.log(value.data);

                form.setValue("customer.firstName", value.data.firstName);
                form.setValue("customer.lastName", value.data.lastName);
                form.setValue("customer.email", value.data.email);
                form.setValue("customer.phone", value.data.phone ?? undefined);
                form.setValue("shippingAddress", address ?? undefined);
                form.setValue("billingAddress", address ?? undefined);
                form.setValue("customer.id", value.data.id);
                form.setValue("customer.addresses", value.data.addresses);
                form.setValue(
                  "customer.ordersCount",
                  value.data._count?.orders ?? 0,
                );
                form.setValue("email", value.data.email);
                form.setValue("phone", value.data.phone ?? undefined);
              }}
              value={value}
              disabled={disabled}
              createButtonLabel="Create new"
              // createIfNotFound={() => {
              //   toastService.inform("Not currently available yet. ");
              // }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
