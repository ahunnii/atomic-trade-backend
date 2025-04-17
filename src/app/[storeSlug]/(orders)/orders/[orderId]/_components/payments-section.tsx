"use client";

import { cn } from "~/lib/utils";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

type Props = {
  subtotalInCents: number;
  taxInCents: number;
  shippingInCents: number;
  discountInCents: number;
  feeInCents: number;
  totalInCents: number;
  metadata: Record<string, unknown>;
  paidInFull: boolean;
};

export const PaymentsSection = ({
  subtotalInCents,
  taxInCents,
  shippingInCents,
  discountInCents,
  feeInCents,
  totalInCents,
  metadata,
  paidInFull,
}: Props) => {
  return (
    <Card className="px-6">
      <div className="flex items-center justify-between">
        <h2 className={cn("text-lg font-semibold")}>Payment Summary</h2>
        {paidInFull ? (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            Paid
          </span>
        ) : (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
            Unpaid
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(subtotalInCents / 100)}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Discount: {metadata?.discountReason as string}</span>

          <span className="font-medium">
            {discountInCents > 0 && "-"}
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(discountInCents / 100)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(taxInCents / 100)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(shippingInCents / 100)}
          </span>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-semibold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalInCents / 100)}
            </span>
          </div>
        </div>
      </div>
      <Separator />
      {paidInFull && (
        <div className="flex justify-between">
          <span className="text-gray-600">Customer Paid</span>
          <span className="font-medium">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalInCents / 100)}
          </span>
        </div>
      )}

      {feeInCents > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-600">Fee</span>
          <span className="font-medium">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(feeInCents / 100)}
          </span>
        </div>
      )}
    </Card>
  );
};
