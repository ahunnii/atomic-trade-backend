"use client";

import type { UseFormReturn } from "react-hook-form";
import Link from "next/link";
import { checkAndHighlightErrors } from "~/utils/highlight-errors";
import { MoreHorizontal } from "lucide-react";

import type { DraftOrderFormData } from "~/lib/validators/order";
import type { CustomerWithOrders } from "~/types/customer";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { FormCardSection } from "~/components/shared/form-card-section";

import { CustomerFormField } from "../../_components/customer-form-field";
import { EditAddressDialog } from "../../_components/edit-address-dialog";
import { EditContactDialog } from "../../_components/edit-contact-dialog";

type Props = {
  form: UseFormReturn<DraftOrderFormData>;
  customers: CustomerWithOrders[];
  isLoading: boolean;
  storeSlug: string;
};

export const DraftCustomerSection = ({ form, customers, storeSlug }: Props) => {
  const hasErrors = checkAndHighlightErrors({
    form,
    keys: ["customer.email", "email", "customer"],
  });

  const shippingAddress = form.watch("shippingAddress");
  const billingAddress = form.watch("billingAddress");
  const customer = form.watch("customer");

  const { firstName, lastName, email, phone, addresses, ordersCount } =
    customer;

  const resetToDefault = () => {
    form.setValue(
      "shippingAddress",
      addresses?.find((address) => address.isDefault) ?? undefined,
    );
    form.setValue(
      "billingAddress",
      addresses?.find((address) => address.isDefault) ?? undefined,
    );
  };

  const ManageButton = (
    <>
      {form.watch("customer.id") && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link" type="button">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <Link href={`/${storeSlug}/customers/${customer.id}/edit`}>
                <DropdownMenuItem>Edit customer</DropdownMenuItem>
              </Link>

              <DropdownMenuItem onClick={resetToDefault}>
                Reset addresses to default
              </DropdownMenuItem>

              <EditAddressDialog
                form={form}
                name="shippingAddress"
                includeCustomerName
              >
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  Edit order&apos;s shipping address
                </DropdownMenuItem>
              </EditAddressDialog>
              <EditAddressDialog
                form={form}
                name="billingAddress"
                includeCustomerName
              >
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  Edit order&apos;s billing address
                </DropdownMenuItem>
              </EditAddressDialog>

              <EditContactDialog form={form}>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  Edit contact information
                </DropdownMenuItem>
              </EditContactDialog>
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
    </>
  );
  return (
    <FormCardSection
      title="Customer"
      ManageButton={ManageButton}
      className={cn(hasErrors && "border-red-500 shadow-red-500/20")}
    >
      {form.watch("customer.id") ? (
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="mb-2 font-medium">
              {firstName} {lastName}
            </h4>
            <p className="text-sm text-gray-600">
              {ordersCount
                ? `${ordersCount} orders`
                : "Unknown number of orders"}
            </p>
          </div>

          <Separator />

          <div>
            <h4 className="mb-2 font-medium">CONTACT INFORMATION</h4>
            <p className="text-sm text-gray-600">
              {form.watch("email") ?? email ?? "No email"}
            </p>
            <p className="text-sm text-gray-600">
              {form.watch("phone") ?? phone ?? "No phone number"}
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="mb-2 font-medium">SHIPPING ADDRESS</h4>
            {form.watch("shippingAddress") ? (
              <div className="text-sm text-gray-600">
                <p>{`${shippingAddress?.firstName} ${shippingAddress?.lastName}`}</p>
                <p>{shippingAddress?.street}</p>
                <p>
                  {shippingAddress?.city} {shippingAddress?.state}{" "}
                  {shippingAddress?.postalCode}
                </p>
                <p>{shippingAddress?.country}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No shipping address</p>
            )}
          </div>
          <Separator />
          <div>
            <h4 className="mb-2 font-medium">BILLING ADDRESS</h4>
            {billingAddress?.formatted !== shippingAddress?.formatted ? (
              <div className="text-sm text-gray-600">
                <p>{`${billingAddress?.firstName} ${billingAddress?.lastName}`}</p>
                <p>{billingAddress?.street}</p>
                <p>
                  {billingAddress?.city} {billingAddress?.state}{" "}
                  {billingAddress?.postalCode}
                </p>
                <p>{billingAddress?.country}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Same as shipping address</p>
            )}
          </div>
        </div>
      ) : (
        <CustomerFormField form={form} customers={customers ?? []} />
      )}
    </FormCardSection>
  );
};
