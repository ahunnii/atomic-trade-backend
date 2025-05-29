"use client";

import type { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { useParams } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";

import type { Address, Customer } from "@prisma/client";

import type { DraftOrderFormData } from "~/lib/validators/order";
import type { CustomerWithOrders } from "~/types/customer";
import type { OrderWithOrderItems } from "~/types/order";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { Separator } from "~/components/ui/separator";
import { AutoCompleteAddressFormField } from "~/components/input/autocomplete-address-form-field";
import { InputFormField } from "~/components/input/input-form-field";
import { LoadButton } from "~/components/shared/load-button";

import { CustomerFormField } from "../../../_components/customer-form-field";

type CustomerFormData = {
  email: string;
  phone: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  customer: Customer & { addresses: Address[]; _count: { orders: number } };
};

type Props = {
  customers: CustomerWithOrders[];
  order?: OrderWithOrderItems;
};

export const CustomerSection = ({ customers, order }: Props) => {
  const params = useParams();
  const orderId = params.orderId as string;

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["order"],
  });

  const updateOrderCustomerInfo =
    api.order.updateOrderCustomerInfo.useMutation(defaultActions);

  const [selectedCustomer, setSelectedCustomer] =
    useState<Partial<CustomerWithOrders> | null>({
      id: order?.customerId ?? "",
      firstName: order?.customer?.firstName ?? "",
      lastName: order?.customer?.lastName ?? "",
      email: order?.customer?.email ?? "",
      phone: order?.customer?.phone ?? "",
      addresses: order?.customer?.addresses ?? [],
      _count: {
        orders: order?.customer?._count?.orders ?? 0,
      },
    });
  const [shippingAddress, setShippingAddress] = useState(
    order?.shippingAddress,
  );
  const [billingAddress, setBillingAddress] = useState(order?.billingAddress);
  const [editingContact, setEditingContact] = useState(false);

  const customerForm = useForm<CustomerFormData>({
    defaultValues: {
      email: !!order?.email ? order?.email : (order?.customer?.email ?? ""),
      phone: !!order?.phone ? order?.phone : (order?.customer?.phone ?? ""),
      shippingAddress: order?.shippingAddress ?? undefined,
      billingAddress: order?.billingAddress ?? undefined,
      shippingAddressId:
        order?.shippingAddress && "id" in order.shippingAddress
          ? order.shippingAddress.id
          : undefined,
      billingAddressId:
        order?.billingAddress && "id" in order.billingAddress
          ? order.billingAddress.id
          : undefined,
      customer: {
        id: order?.customerId ?? "",
        firstName: order?.customer?.firstName ?? "",
        lastName: order?.customer?.lastName ?? "",
        email: order?.customer?.email ?? "",
        phone: order?.customer?.phone ?? "",
        addresses: order?.customer?.addresses ?? [],
        _count: {
          orders: order?.customer?._count?.orders ?? 0,
        },
      },
    },
  });

  const handleUpdateCustomerInfo = async (data: CustomerFormData) => {
    await updateOrderCustomerInfo.mutateAsync({
      orderId,
      customerId:
        data.customer.id ?? selectedCustomer?.id ?? order?.customerId ?? "",
      email: data.email,
      phone: data.phone,
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress,
      shippingAddressId: data.shippingAddressId,
      billingAddressId: data.billingAddressId,
    });

    setEditingContact(false);
  };

  const handleSaveContactInfo = () => {
    void handleUpdateCustomerInfo(customerForm.getValues());
    // setEditingContact(false);
  };

  const handleCancelContactEdit = () => {
    // Reset form to original values
    customerForm.reset({
      email: !!order?.email ? order?.email : (order?.customer?.email ?? ""),
      phone: !!order?.phone ? order?.phone : (order?.customer?.phone ?? ""),

      shippingAddress: order?.shippingAddress ?? undefined,
      billingAddress: order?.billingAddress ?? undefined,
      customer: {
        id: order?.customerId ?? "",
        firstName: order?.customer?.firstName ?? "",
        lastName: order?.customer?.lastName ?? "",
        email: order?.customer?.email ?? "",
        phone: order?.customer?.phone ?? "",
        addresses: order?.customer?.addresses ?? [],
        _count: {
          orders: order?.customer?._count?.orders ?? 0,
        },
      },
    });
    setShippingAddress(order?.shippingAddress);
    setBillingAddress(order?.billingAddress);
    setEditingContact(false);
  };

  // For direct editing mode (existing order)
  return (
    <Card className="px-6">
      <div className="space-y-6">
        <div className="space-y-4">
          <Form {...customerForm}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveContactInfo();
              }}
              className="space-y-4"
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
            >
              {" "}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Customer</h3>
                {editingContact && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleCancelContactEdit}
                      disabled={updateOrderCustomerInfo.isPending}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <LoadButton
                      type="button"
                      onClick={handleSaveContactInfo}
                      disabled={updateOrderCustomerInfo.isPending}
                      isLoading={updateOrderCustomerInfo.isPending}
                    >
                      {updateOrderCustomerInfo.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </LoadButton>
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex flex-col gap-0">
                  <h4 className="mt-4 mb-2 font-medium">
                    {selectedCustomer?.firstName ?? order?.customer?.firstName}{" "}
                    {selectedCustomer?.lastName ?? order?.customer?.lastName}
                  </h4>
                  <h5 className="text-sm text-gray-600">
                    {selectedCustomer?._count?.orders ?? 0} orders
                  </h5>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingContact(true)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Customer</DialogTitle>
                    </DialogHeader>{" "}
                    <div className="mt-4 h-92">
                      <CustomerFormField
                        customers={customers ?? []}
                        form={
                          customerForm as unknown as UseFormReturn<DraftOrderFormData>
                        }
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Separator />
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="mb-2 font-medium">CONTACT INFORMATION</h4>
                  {!editingContact && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingContact(true)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {editingContact ? (
                  <div className="space-y-2">
                    <InputFormField
                      form={customerForm}
                      name="email"
                      label="Email"
                    />
                    <InputFormField
                      form={customerForm}
                      name="phone"
                      label="Phone"
                    />
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    <p>{customerForm.watch("email") ?? "No email address"}</p>
                    <p>{customerForm.watch("phone") ?? "No phone number"}</p>
                  </div>
                )}
              </div>
              <Separator />
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="mb-2 font-medium">SHIPPING ADDRESS</h4>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingContact(true)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Shipping Address</DialogTitle>
                        <AutoCompleteAddressFormField
                          form={customerForm}
                          name="shippingAddress.formatted"
                          defaultValue={
                            shippingAddress ??
                            order?.shippingAddress ??
                            undefined
                          }
                          onSelectAdditional={(address) => {
                            setEditingContact(true);
                            setShippingAddress(address as Address);
                            customerForm.setValue(
                              "shippingAddress",
                              address as Address,
                            );

                            // handleUpdateCustomerInfo({
                            //   ...customerForm.getValues(),
                            //   shippingAddress: address,
                            // });
                          }}
                        />
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>

                {(shippingAddress ?? order?.shippingAddress) ? (
                  <div className="text-sm text-gray-600">
                    {" "}
                    <p>{`${shippingAddress?.firstName} ${shippingAddress?.lastName}`}</p>
                    <p>
                      {shippingAddress?.formatted ??
                        order?.shippingAddress?.formatted}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No shipping address</p>
                )}
              </div>
              <Separator />
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="mb-2 font-medium">BILLING ADDRESS</h4>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingContact(true)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Billing Address</DialogTitle>
                        <AutoCompleteAddressFormField
                          form={customerForm}
                          name="billingAddress.formatted"
                          defaultValue={
                            billingAddress ?? order?.billingAddress ?? undefined
                          }
                          onSelectAdditional={(address) => {
                            setBillingAddress(address as Address);
                            customerForm.setValue(
                              "billingAddress",
                              address as Address,
                            );
                            // handleUpdateCustomerInfo({
                            //   ...customerForm.getValues(),
                            //   billingAddress: address,
                            // });
                          }}
                        />
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>

                {billingAddress?.formatted !== shippingAddress?.formatted ? (
                  <div className="text-sm text-gray-600">
                    <p>{`${billingAddress?.firstName} ${billingAddress?.lastName}`}</p>
                    <p>
                      {billingAddress?.formatted ??
                        order?.billingAddress?.formatted}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Same as shipping address
                  </p>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Card>
  );
};
