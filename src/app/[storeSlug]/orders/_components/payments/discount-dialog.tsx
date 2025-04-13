"use client";

import type { FieldArrayWithId, UseFormReturn } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { XIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import type { DiscountFormData } from "../../_validators/discount-dialog";
import type { ProductOrderFormData } from "~/lib/validators/order";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { CurrencyFormField } from "~/components/input/currency-form-field";
import { SelectFormField } from "~/components/input/select-form-field";
import { TestNumberFormField } from "~/components/input/test-number-form-field";

type Props = {
  form: UseFormReturn<ProductOrderFormData>;
  loading: boolean;
  orderItemIndex?: number;
  children: React.ReactNode;
  field?: FieldArrayWithId<ProductOrderFormData, "orderItems", "id">;
  initialData?: DiscountFormData;
};

export const DiscountDialog = ({
  form,
  loading,
  orderItemIndex,
  children,

  initialData,
}: Props) => {
  const [open, setOpen] = useState(false);

  const initialValues = useMemo(() => {
    console.log("Initial data:", initialData);
    return {
      discountType: initialData?.discountType ?? "amount",
      discountValue: initialData?.discountValue ?? 0,
      reason: initialData?.reason ?? "",
    };
  }, [initialData]);

  const discountForm = useForm<DiscountFormData>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (initialData) {
      console.log("Setting form values:", initialData);
      discountForm.reset(initialData);
    }
  }, [initialData, discountForm]);

  const handleSubmit = (data: DiscountFormData) => {
    if (orderItemIndex !== undefined) {
      const orderItem = form.getValues().orderItems[orderItemIndex];
      if (!orderItem) return;

      const discountInCents =
        data.discountType === "amount"
          ? Math.round(data.discountValue)
          : Math.round(
              orderItem.unitPriceInCents *
                orderItem.quantity *
                data.discountValue,
            );

      const updatedItem = {
        ...orderItem,
        discountInCents,
        discountReason: data.reason,
        totalPriceInCents: orderItem.unitPriceInCents - discountInCents,
      };

      const orderItems = [...form.getValues().orderItems];
      orderItems[orderItemIndex] = updatedItem;
      form.setValue("orderItems", orderItems);
      console.log("applied to item");
    } else {
      form.setValue("discountInCents", data.discountValue);
      form.setValue("discountReason", data.reason);
      form.setValue("discountType", data.discountType);
      console.log("applied to order");
    }

    setOpen(false);
    discountForm.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>{children}</div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" withoutClose>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Add discount</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              type="button"
              onClick={() => setOpen(false)}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(discountForm.getValues());
          }}
          className="space-y-6 py-4"
        >
          <div className="space-y-4">
            <div className="flex w-full gap-4">
              <SelectFormField
                form={discountForm}
                name="discountType"
                label="Discount type"
                values={[
                  { label: "Amount", value: "amount" },
                  { label: "Percentage", value: "percentage" },
                ]}
              />

              {discountForm.watch("discountType") === "percentage" ? (
                <TestNumberFormField
                  form={discountForm}
                  name="discountValue"
                  label="Discount value"
                  className="w-full"
                />
              ) : (
                <CurrencyFormField
                  form={discountForm}
                  name="discountValue"
                  label="Discount value"
                  className="w-full"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="Enter a reason for the discount"
                value={discountForm.watch("reason")}
                onChange={(e) =>
                  discountForm.setValue("reason", e.target.value)
                }
                className="resize-none"
              />
              <p className="text-muted-foreground text-xs">
                Your customers can see this reason
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit(discountForm.getValues())}
            >
              Apply
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
