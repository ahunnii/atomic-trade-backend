"use client";

import type { UseFormReturn } from "react-hook-form";
import { MoreHorizontal } from "lucide-react";

import type { DraftOrderFormData } from "~/lib/validators/order";
import type { Customer } from "~/types/customer";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { AutoCompleteAddressFormField } from "~/components/input/autocomplete-address-form-field";

import { CustomerFormField } from "../../_components/customer/customer-form-field";

type Props = {
  form: UseFormReturn<DraftOrderFormData>;
  customers: Customer[];
  isLoading: boolean;
};

export const DraftCustomerSection = ({ form, customers }: Props) => {
  return (
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
                    <DropdownMenuItem
                      onClick={() => {
                        form.setValue(
                          "shippingAddress",
                          form
                            .getValues("customer.addresses")
                            ?.find((address) => address.isDefault) ?? undefined,
                        );
                        form.setValue(
                          "billingAddress",
                          form
                            .getValues("customer.addresses")
                            ?.find((address) => address.isDefault) ?? undefined,
                        );
                      }}
                    >
                      Reset addresses to default
                    </DropdownMenuItem>
                    <Dialog>
                      <DialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                          }}
                        >
                          Edit order&apos;s shipping address
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit shipping address</DialogTitle>
                          <AutoCompleteAddressFormField
                            form={form}
                            name={`shippingAddress.formatted`}
                            defaultValue={{
                              id: form.getValues("shippingAddress.id"),
                              formatted:
                                form.getValues("shippingAddress.formatted") ??
                                "",
                              street:
                                form.getValues("shippingAddress.street") ?? "",
                              additional:
                                form.getValues("shippingAddress.additional") ??
                                "",
                              city:
                                form.getValues("shippingAddress.city") ?? "",
                              state:
                                form.getValues("shippingAddress.state") ?? "",
                              postalCode:
                                form.getValues("shippingAddress.postalCode") ??
                                "",
                              country:
                                form.getValues("shippingAddress.country") ?? "",
                            }}
                            onSelectAdditional={(address) => {
                              form.setValue("shippingAddress", {
                                id: address.id,
                                formatted: address.formatted,
                                street: address.street,
                                additional: address.additional,
                                city: address.city,
                                state: address.state,
                                postalCode: address.postalCode,
                                country: address.country,
                                firstName:
                                  form.getValues("customer.firstName") ?? "",
                                lastName:
                                  form.getValues("customer.lastName") ?? "",
                              });
                            }}
                          />
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                          }}
                        >
                          Edit order&apos;s billing address
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit billing address</DialogTitle>
                          <AutoCompleteAddressFormField
                            form={form}
                            name={`billingAddress.formatted`}
                            defaultValue={{
                              id: form.getValues("billingAddress.id"),
                              formatted:
                                form.getValues("billingAddress.formatted") ??
                                "",
                              street:
                                form.getValues("billingAddress.street") ?? "",
                              additional:
                                form.getValues("billingAddress.additional") ??
                                "",
                              city: form.getValues("billingAddress.city") ?? "",
                              state:
                                form.getValues("billingAddress.state") ?? "",
                              postalCode:
                                form.getValues("billingAddress.postalCode") ??
                                "",
                              country:
                                form.getValues("billingAddress.country") ?? "",
                            }}
                            onSelectAdditional={(address) => {
                              form.setValue("billingAddress", {
                                id: address.id,
                                formatted: address.formatted,
                                street: address.street,
                                additional: address.additional,
                                city: address.city,
                                state: address.state,
                                postalCode: address.postalCode,
                                country: address.country,
                                firstName:
                                  form.getValues("customer.firstName") ?? "",
                                lastName:
                                  form.getValues("customer.lastName") ?? "",
                              });
                            }}
                          />
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>

                    <DropdownMenuItem
                      className="text-red-500 hover:text-red-600!"
                      onClick={() => {
                        form.setValue("billingAddress", undefined);
                        form.setValue("shippingAddress", undefined);
                        form.setValue("customer", {
                          id: "",
                          firstName: "",
                          lastName: "",
                          email: "",
                          phone: "",
                          addresses: [],
                        });
                      }}
                    >
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
                  {form.watch("customer.ordersCount")
                    ? `${form.watch("customer.ordersCount")} orders`
                    : "Unknown number of orders"}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 font-medium">CONTACT INFORMATION</h4>
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
                {form.watch("shippingAddress") ? (
                  <div className="text-sm text-gray-600">
                    <p>{`${form.watch("customer.firstName")} ${form.watch("customer.lastName")}`}</p>
                    <p>{form.watch("shippingAddress.street")}</p>
                    <p>
                      {form.watch("shippingAddress.city")}{" "}
                      {form.watch("shippingAddress.state")}{" "}
                      {form.watch("shippingAddress.postalCode")}
                    </p>
                    <p>{form.watch("shippingAddress.country")}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No shipping address</p>
                )}
              </div>
              <Separator />
              <div>
                <h4 className="mb-2 font-medium">BILLING ADDRESS</h4>
                {form.watch("billingAddress.formatted") !==
                form.watch("shippingAddress.formatted") ? (
                  <div className="text-sm text-gray-600">
                    <p>{`${form.watch("customer.firstName")} ${form.watch("customer.lastName")}`}</p>
                    <p>{form.watch("billingAddress.street")}</p>
                    <p>
                      {form.watch("billingAddress.city")}{" "}
                      {form.watch("billingAddress.state")}{" "}
                      {form.watch("billingAddress.postalCode")}
                    </p>
                    <p>{form.watch("billingAddress.country")}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Same as shipping address
                  </p>
                )}
              </div>
            </div>
          ) : (
            <CustomerFormField form={form} customers={customers ?? []} />
          )}
        </div>
      </div>
    </Card>
  );
};
