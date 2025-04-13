"use client";

import type {
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayReplace,
  UseFieldArrayUpdate,
  UseFormReturn,
} from "react-hook-form";
import { useState } from "react";
import { XIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import type { ProductOrderFormData } from "~/lib/validators/order";
import { cn } from "~/lib/utils";
import { Button, buttonVariants } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { CurrencyFormField } from "~/components/input/currency-form-field";
import { InputFormField } from "~/components/input/input-form-field";
import { TestNumberFormField } from "~/components/input/test-number-form-field";

type Props = {
  form: UseFormReturn<ProductOrderFormData>;
  loading: boolean;
  append: UseFieldArrayAppend<ProductOrderFormData>;
  field?: FieldArrayWithId<ProductOrderFormData, "orderItems", "id">;
  fieldIndex?: number;
  update?: UseFieldArrayUpdate<ProductOrderFormData>;
  replace?: UseFieldArrayReplace<ProductOrderFormData>;
};

type NewItemFormData = {
  name: string;
  unitPriceInCents: number;
  quantity: number;
  isPhysical: boolean;
  chargeTax: boolean;
  discountReason: string;
};

export const CustomOrderItemDialog = ({
  append,
  field,
  update,
  fieldIndex,
}: Props) => {
  const [open, setOpen] = useState(false);
  const newItemForm = useForm<NewItemFormData>({
    defaultValues: {
      name: field?.name ?? "",
      unitPriceInCents: field?.unitPriceInCents ?? 0,
      quantity: field?.quantity ?? 1,
      isPhysical: field?.isPhysical ?? false,
      chargeTax: field?.chargeTax ?? false,
      discountReason: field?.discountReason ?? "",
    },
  });

  const handleSubmit = (data: NewItemFormData) => {
    const newItem = {
      name: data.name,
      description: "Custom item",
      variantId: "",
      productId: "",
      unitPriceInCents: data.unitPriceInCents,
      discountInCents: 0,
      totalPriceInCents: data.unitPriceInCents,
      quantity: data.quantity,
      isPhysical: data.isPhysical,
      chargeTax: data.chargeTax,
      discountReason: data.discountReason,
      discountType: "amount" as const,
    };

    if (field && fieldIndex !== undefined) {
      update?.(fieldIndex, newItem);
    } else {
      append(newItem);
    }
    setOpen(false);
    newItemForm.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className={cn(
            field &&
              buttonVariants({
                variant: "secondary",
                size: "sm",
                className: "h-8 text-xs",
              }),
          )}
        >
          {field ? "Edit" : "Add custom item"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" withoutClose>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Add custom item</DialogTitle>
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
            handleSubmit(newItemForm.getValues());
          }}
          className="space-y-6 py-4"
        >
          <div className="space-y-4">
            <InputFormField
              form={newItemForm}
              name="name"
              label="Item name"
              placeholder="Custom t-shirt"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <CurrencyFormField
                  form={newItemForm}
                  name="unitPriceInCents"
                  label="Price"
                  placeholder="US$ 30.00"
                />
              </div>
              <div>
                <TestNumberFormField
                  form={newItemForm}
                  name="quantity"
                  label="Quantity"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="taxable" />
                <Label htmlFor="taxable">Charge tax on this product</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="physical" defaultChecked />
                <Label htmlFor="physical">This is a physical product</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Item weight (optional)</Label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="0"
                  className="flex-1 rounded-md border px-3 py-2"
                />
                <Select defaultValue="kg">
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-muted-foreground text-sm">
                Used to calculate shipping rates accurately
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
              onClick={() => handleSubmit(newItemForm.watch())}
            >
              Done
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
