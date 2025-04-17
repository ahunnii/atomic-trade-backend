import type { UseFormReturn } from "react-hook-form";
import { useMemo, useState } from "react";
import { X } from "lucide-react";

import type { Option } from "~/components/ui/custom/autocomplete-input";
import type { DraftOrderFormData } from "~/lib/validators/order";
import type { ProductRequestFormData } from "~/lib/validators/product-request";
import type { Customer } from "~/types/customer";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
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
  form: UseFormReturn<ProductRequestFormData>;
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
  initialData?: Customer;
};

export function SimplifiedCustomerFormField({
  form,
  label,
  description,
  className,
  customers,
  disabled,
  initialData,
}: Props) {
  const [value, setValue] = useState<Option<Customer | string>>();

  const formattedCustomers = useMemo(() => {
    return customers.map((customer) => ({
      value: customer.id,
      label: `${customer.firstName} ${customer.lastName}`,
      sublabel: customer.email,
      data: customer,
    })) as Option<Customer>[];
  }, [customers]);

  const customer = form.watch("customer");
  const customerId = form.watch("customerId");
  return (
    <FormField
      control={form.control}
      name="customer"
      render={({}) => (
        <FormItem className={cn("col-span-full", className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div className="flex items-center gap-2">
              {!customerId && (
                <AutoComplete
                  options={formattedCustomers ?? []}
                  emptyMessage="No results."
                  placeholder="Search for a customer..."
                  isLoading={false}
                  onValueChange={(value: Option<Customer>) => {
                    setValue(value);
                    form.setValue("customerId", value.data.id);

                    form.setValue("customer.firstName", value.data.firstName);
                    form.setValue("customer.lastName", value.data.lastName);
                    form.setValue("customer.email", value.data.email);
                    form.setValue("customer.phone", value.data.phone ?? "");
                    form.setValue("customer.id", value.data.id);

                    form.setValue(
                      "customer.ordersCount",
                      value.data._count?.orders ?? 0,
                    );

                    form.setValue(
                      "email",
                      initialData?.email ??
                        (form.getValues("email") !== ""
                          ? form.getValues("email")
                          : value.data.email),
                    );
                    form.setValue(
                      "phone",
                      initialData?.phone ??
                        (form.getValues("phone") !== ""
                          ? form.getValues("phone")
                          : value.data.phone),
                    );
                    form.setValue(
                      "firstName",
                      initialData?.firstName ??
                        (form.getValues("firstName") !== ""
                          ? form.getValues("firstName")
                          : value.data.firstName),
                    );
                    form.setValue(
                      "lastName",
                      initialData?.lastName ??
                        (form.getValues("lastName") !== ""
                          ? form.getValues("lastName")
                          : value.data.lastName),
                    );
                  }}
                  value={value as Option<Customer>}
                  disabled={disabled}
                  createButtonLabel="Create new"
                />
              )}

              {customerId && (
                <>
                  <div className="border-input bg-muted text-muted-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50">
                    {customer?.firstName} {customer?.lastName}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => {
                      form.setValue("customerId", undefined);
                      form.setValue("customer", {
                        firstName: "",
                        lastName: "",
                        email: "",
                        id: "",
                        phone: "",
                        ordersCount: 0,
                      });

                      setValue({
                        value: "",
                        label: "",
                        sublabel: "",
                        data: "",
                      });
                    }}
                  >
                    <X />
                  </Button>
                </>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
