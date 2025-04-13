"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import type { ProductOrderFormData } from "~/lib/validators/order";
import type { Customer } from "~/types/customer";
import type { Order } from "~/types/order";
import type { PartialProduct, Product } from "~/types/product";
import { productOrderFormValidator } from "~/lib/validators/order";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Form } from "~/components/ui/form";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Separator } from "~/components/ui/separator";
import { AutocompleteExample } from "~/components/input/autocomplete-form-field";
import { FormAdditionalOptionsButton } from "~/components/shared/form-additional-options-button";
import { FormHeader } from "~/components/shared/form-header";
import { FormSaveOptionsButton } from "~/components/shared/form-save-options-button";
import { FormSection } from "~/components/shared/form-section";

import { CustomerFormField } from "../customer/customer-form-field";
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
      customer: {
        id: initialData?.customerId ?? "",
        firstName: initialData?.customer?.firstName ?? "",
        lastName: initialData?.customer?.lastName ?? "",
        email: initialData?.customer?.email ?? "",
        phone: initialData?.customer?.phone ?? "",
        shippingAddress:
          initialData?.customer?.addresses?.find(
            (address) => address.isDefault,
          ) ?? undefined,
        billingAddress:
          initialData?.customer?.addresses?.find(
            (address) => address.isDefault,
          ) ?? undefined,
      },
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
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-5">
              <Card className="px-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Customer</h3>

                      {form.watch("customer.id") && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="link" type="button">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuGroup>
                              <DropdownMenuItem>Edit customer</DropdownMenuItem>
                              <DropdownMenuItem>
                                Edit order&apos;s shipping address
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Edit order&apos;s payment address
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500 hover:text-red-600!">
                                Remove customer
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    {form.watch("customer.id") ? (
                      <div className="mt-4 space-y-4">
                        <div>
                          <h4 className="mb-2 font-medium">
                            {form.watch("customer.firstName")}{" "}
                            {form.watch("customer.lastName")}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Unknown number of orders
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="mb-2 font-medium">
                            CONTACT INFORMATION
                          </h4>
                          <p className="text-sm text-gray-600">
                            {form.watch("customer.email")}
                          </p>
                          <p className="text-sm text-gray-600">
                            {form.watch("customer.phone") ?? "No phone number"}
                          </p>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="mb-2 font-medium">SHIPPING ADDRESS</h4>
                          {form.watch("customer.shippingAddress") ? (
                            <div className="text-sm text-gray-600">
                              <p>{`${form.watch("customer.firstName")} ${form.watch("customer.lastName")}`}</p>
                              <p>
                                {form.watch("customer.shippingAddress.street")}
                              </p>
                              <p>
                                {form.watch("customer.shippingAddress.city")}{" "}
                                {form.watch("customer.shippingAddress.state")}{" "}
                                {form.watch(
                                  "customer.shippingAddress.postalCode",
                                )}
                              </p>
                              <p>
                                {form.watch("customer.shippingAddress.country")}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600">
                              No shipping address
                            </p>
                          )}
                        </div>
                        <Separator />
                        <div>
                          <h4 className="mb-2 font-medium">BILLING ADDRESS</h4>
                          {form.watch("customer.billingAddress")?.id !==
                          form.watch("customer.shippingAddress")?.id ? (
                            <div className="text-sm text-gray-600">
                              <p>{`${form.watch("customer.firstName")} ${form.watch("customer.lastName")}`}</p>
                              <p>
                                {form.watch("customer.billingAddress.street")}
                              </p>
                              <p>
                                {form.watch("customer.billingAddress.city")}{" "}
                                {form.watch("customer.billingAddress.state")}{" "}
                                {form.watch(
                                  "customer.billingAddress.postalCode",
                                )}
                              </p>
                              <p>
                                {form.watch("customer.billingAddress.country")}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600">
                              Same as shipping address
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <CustomerFormField
                        form={form}
                        customers={customers ?? []}
                      />
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};
