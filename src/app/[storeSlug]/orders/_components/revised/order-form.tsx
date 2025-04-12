"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import type { ProductOrderFormData } from "~/lib/validators/order";
import type { Customer, Order } from "~/types/order";
import type { PartialProduct, Product } from "~/types/product";
import { productOrderFormValidator } from "~/lib/validators/order";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Form } from "~/components/ui/form";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { AutocompleteExample } from "~/components/input/autocomplete-form-field";
import { FormAdditionalOptionsButton } from "~/components/shared/form-additional-options-button";
import { FormHeader } from "~/components/shared/form-header";
import { FormSaveOptionsButton } from "~/components/shared/form-save-options-button";
import { FormSection } from "~/components/shared/form-section";

import { OrderItemSection } from "../order-items/order-item-section";
import { PaymentsSection } from "../payments/payments-section";

type Props = {
  initialData: Order | null;
  products: PartialProduct[];
  customers: Customer[];
  storeId: string;
  storeSlug: string;
};

export const OrderForm = ({
  initialData,
  products,
  customers,
  storeId,
  storeSlug,
}: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["order"],
    redirectPath: `/${storeSlug}/orders`,
  });

  const [open, setOpen] = useState<boolean>(false);
  const [customerMode, setCustomerMode] = useState<
    "newCustomer" | "existingCustomer"
  >("existingCustomer");

  const title = initialData ? "Edit order" : "Create order";
  const description = initialData ? "Edit a order." : "Add a new order";

  const createOrder = api.order.create.useMutation(defaultActions);
  const updateOrder = api.order.update.useMutation(defaultActions);
  const deleteOrder = api.order.delete.useMutation(defaultActions);

  const form = useForm<ProductOrderFormData>({
    resolver: zodResolver(productOrderFormValidator),
    defaultValues: {
      orderItems: initialData?.orderItems ?? [],
      discountInCents: 0,
      discountReason: "",
      collectTax: true,
    },
  });

  console.log("Form values:", form.watch());

  const onSubmit = (data: ProductOrderFormData) => {
    if (initialData)
      updateOrder.mutate({ ...data, orderId: initialData.id, storeId });
    else createOrder.mutate({ ...data, storeId });
  };

  const onDelete = () =>
    initialData ? deleteOrder.mutate(initialData.id) : null;

  const isLoading = false;

  const onSave = (data: ProductOrderFormData, publish = false) => {
    console.log(data);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          onChange={(e) => {
            console.log(form.watch());
            console.log(form.formState.errors);
          }}
        >
          <FormHeader title={title} link={`/${storeSlug}/collections`}>
            {initialData && <FormAdditionalOptionsButton onDelete={onDelete} />}

            <FormSaveOptionsButton
              onSave={() => onSave(form.getValues(), false)}
              onPublish={() => onSave(form.getValues(), true)}
              isLoading={isLoading}
            />
          </FormHeader>
          <section className="form-body grid w-full grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-7">
              <FormSection
                title="Customer"
                description="Set the customer data for the order"
              >
                <RadioGroup
                  defaultValue={customerMode}
                  className="grid grid-cols-2 gap-4"
                >
                  {" "}
                  <div>
                    <RadioGroupItem
                      value="existingCustomer"
                      id="existingCustomer"
                      className="peer sr-only"
                      onClick={() => {
                        setCustomerMode("existingCustomer");
                      }}
                    />
                    <Label
                      htmlFor="existingCustomer"
                      className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary flex flex-col items-center justify-between rounded-md border-2 p-4"
                    >
                      Existing Customer
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="newCustomer"
                      id="newCustomer"
                      className="peer sr-only"
                      onClick={() => {
                        setCustomerMode("newCustomer");
                      }}
                    />
                    <Label
                      htmlFor="newCustomer"
                      className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary flex flex-col items-center justify-between rounded-md border-2 p-4"
                    >
                      New Customer
                    </Label>
                  </div>
                </RadioGroup>

                {customerMode === "existingCustomer" && (
                  <p>Existing Customer</p>
                )}

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {/* <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormLabel className="text-muted-foreground text-sm font-normal">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your customer's name"
                            {...field}
                            disabled={orderMutations.isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-muted-foreground text-sm font-normal">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. test@test.com"
                            {...field}
                            disabled={orderMutations.isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-muted-foreground text-sm font-normal">
                          Phone (optional)
                        </FormLabel>
                        <FormControl>
                          <FormattedNumericInput
                            {...field}
                            type="tel"
                            allowEmptyFormatting
                            format="+1 (###) ###-####"
                            mask="_"
                            onChange={(e) => e.preventDefault()}
                            onValueChange={(value) =>
                              field.onChange(`${value.floatValue}`)
                            }
                            required
                            disabled={orderMutations.isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                </div>

                <AutocompleteExample />
              </FormSection>

              <OrderItemSection
                form={form}
                loading={isLoading}
                products={products as Product[]}
              />

              <PaymentsSection
                form={form}
                loading={isLoading}
                products={products as Product[]}
              />
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};
