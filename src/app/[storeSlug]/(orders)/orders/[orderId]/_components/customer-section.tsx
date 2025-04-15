"use client";

import type { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { useParams } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";

import type { Address } from "~/lib/validators/geocoding";
import type { DraftOrderFormData } from "~/lib/validators/order";
import type { Customer } from "~/types/customer";
import type { Order } from "~/types/order";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { AutoCompleteAddressFormField } from "~/components/input/autocomplete-address-form-field";
import { InputFormField } from "~/components/input/input-form-field";
import { LoadButton } from "~/components/shared/load-button";

import { CustomerFormField } from "../../../_components/customer/customer-form-field";

type CustomerFormData = {
  email: string;
  phone: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  customer: Customer & { ordersCount: number };
};

type Props = {
  customers: Customer[];
  order?: Order;
};

export const CustomerSection = ({ customers, order }: Props) => {
  const params = useParams();
  const orderId = params.orderId as string;

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["order"],
  });

  const updateOrderCustomerInfo =
    api.order.updateOrderCustomerInfo.useMutation(defaultActions);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [shippingAddress, setShippingAddress] = useState(
    order?.shippingAddress,
  );
  const [billingAddress, setBillingAddress] = useState(order?.billingAddress);
  const [editingContact, setEditingContact] = useState(false);

  const customerForm = useForm<CustomerFormData>({
    defaultValues: {
      email: order?.email ?? "",
      phone: order?.phone ?? "",
      shippingAddress: order?.shippingAddress,
      billingAddress: order?.billingAddress,
      shippingAddressId: order?.shippingAddress?.id,
      billingAddressId: order?.billingAddress?.id,
      customer: {
        id: order?.customerId ?? "",
        firstName: order?.customer?.firstName ?? "",
        lastName: order?.customer?.lastName ?? "",
        email: order?.customer?.email ?? "",
        phone: order?.customer?.phone ?? "",
        addresses: order?.customer?.addresses ?? [],
        ordersCount: order?.customer?._count?.orders ?? 0,
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
      email: order?.email ?? "",
      phone: order?.phone ?? "",

      shippingAddress: order?.shippingAddress,
      billingAddress: order?.billingAddress,
      customer: {
        id: order?.customerId ?? "",
        firstName: order?.customer?.firstName ?? "",
        lastName: order?.customer?.lastName ?? "",
        email: order?.customer?.email ?? "",
        phone: order?.customer?.phone ?? "",
        addresses: order?.customer?.addresses ?? [],
        ordersCount: order?.customer?._count?.orders ?? 0,
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
                    <p>
                      {customerForm.getValues().email || "No email address"}
                    </p>
                    <p>{customerForm.getValues().phone || "No phone number"}</p>
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
                            shippingAddress ?? order?.shippingAddress
                          }
                          onSelectAdditional={(address) => {
                            setEditingContact(true);
                            setShippingAddress(address);
                            customerForm.setValue("shippingAddress", address);

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
                          defaultValue={billingAddress ?? order?.billingAddress}
                          onSelectAdditional={(address) => {
                            setBillingAddress(address);
                            customerForm.setValue("billingAddress", address);
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
