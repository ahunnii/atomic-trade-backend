"use client";

import type { UseFormReturn } from "react-hook-form";

import type { DraftOrderFormData } from "~/lib/validators/order";
import type { PartialProduct } from "~/types/product";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { MinimalSwitchFormField } from "~/components/input/minimal-switch-form-field";

import { ApplyDiscountDialog } from "../../_components/apply-discount-dialog";

type Props = {
  form: UseFormReturn<DraftOrderFormData>;
  products: PartialProduct[];
  loading: boolean;
  children?: React.ReactNode;
};

export const DraftPaymentsSection = ({ form, loading, children }: Props) => {
  const fields = form.watch("orderItems");

  const subtotal = fields.reduce(
    (sum, field) => sum + (field.totalPriceInCents || 0) * field.quantity,
    0,
  );

  const tax = 0; // TODO: Calculate tax based on rules
  const shipping = 0; // TODO: Calculate shipping based on rules
  const total = subtotal + tax + shipping - form.watch("discountInCents");

  const discountType = form.watch("discountType");
  const discountValue = form.watch("discountInCents");
  const discountReason = form.watch("discountReason");

  return (
    <Card className="px-6">
      <h2 className="text-lg font-semibold">Payment Summary</h2>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(subtotal / 100)}
          </span>
        </div>

        <div className="flex justify-between">
          <ApplyDiscountDialog
            form={form}
            loading={loading}
            initialData={{
              discountType: discountType ?? "amount",
              discountValue: discountValue ?? 0,
              reason: discountReason ?? "",
            }}
          >
            <span className="cursor-pointer text-blue-600 hover:text-blue-700 hover:underline">
              {discountValue > 0 ? "Edit" : "Add"} discount
            </span>
          </ApplyDiscountDialog>
          <span className="font-medium">
            {form.watch("discountInCents") > 0 && "-"}
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(form.watch("discountInCents") / 100)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(tax / 100)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(shipping / 100)}
          </span>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-semibold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(total / 100)}
            </span>
          </div>
        </div>
      </div>
      <Separator />
      {/* Tax */}
      <MinimalSwitchFormField
        form={form}
        name="isTaxExempt"
        label="Tax Exempt"
        description="If the customer is tax exempt"
        className="flex items-center justify-between gap-4"
      />

      {children}
    </Card>
  );
};
