import type { UseFormReturn } from "react-hook-form";
import { Trash2Icon } from "lucide-react";
import { useFieldArray } from "react-hook-form";

import type { ProductFormData } from "~/lib/validators/product";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { CurrencyFormField } from "~/components/input/currency-form-field";
import { InputFormField } from "~/components/input/input-form-field";
import { SwitchFormField } from "~/components/input/switch-form-field";
import { TestNumberFormField } from "~/components/input/test-number-form-field";

import { ManageVariationsButton } from "./manage-variations-button";
import { ProductAttributeDialog } from "./product-attribute-dialog";

type Props = {
  form: UseFormReturn<ProductFormData>;
  loading: boolean;
};

export const ProductVariantDialog = ({ form, loading }: Props) => {
  const { fields, remove } = useFieldArray({
    control: form.control,
    name: `variants` as const,
  });

  const variantCount = form.watch("variants").length;

  return (
    <div className="col-span-full">
      <Dialog>
        <DialogTrigger asChild disabled={loading}>
          <div>
            <ManageVariationsButton variantCount={variantCount} />
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-5xl" withoutClose={true}>
          <DialogHeader>
            <div className="flex items-center justify-between pb-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" size="sm">
                  Close
                </Button>
              </DialogClose>
              <div className="flex gap-2">
                <ProductAttributeDialog form={form} loading={loading} />
              </div>
            </div>
            <DialogTitle>Manage Product Variants</DialogTitle>
            <DialogDescription>
              Manage your product variants here. Currently, you have{" "}
              {variantCount} variants.
            </DialogDescription>
          </DialogHeader>

          <div className="my-5 w-full gap-8 md:grid md:grid-cols-1">
            <ScrollArea className="h-[60svh]" type="always">
              <div className="my-5 gap-8 md:grid md:grid-cols-1">
                {fields.map((field, index) => {
                  return (
                    <div
                      key={field.id}
                      className="flex w-full items-start gap-4"
                    >
                      <div className="flex w-1/5 flex-col gap-2">
                        <Label>Variant</Label>
                        <div className="bg-muted flex h-8 items-center rounded-md px-3 py-2 text-sm font-medium">
                          {form.watch(`variants.${index}.name`) || "Default"}
                        </div>
                      </div>
                      <InputFormField
                        form={form}
                        name={`variants.${index}.sku`}
                        disabled={loading}
                        label="SKU (Optional)"
                        placeholder="e.g. T-Shirt"
                        inputClassName="h-8"
                        className="w-1/5"
                      />
                      <div className="flex w-1/5 flex-col gap-2">
                        <Label>Stock</Label>

                        <div>
                          {!form.watch(`variants.${index}.manageStock`) ? (
                            <div className="border-input bg-background flex h-8 w-full items-center justify-between rounded-md border px-3 py-2 text-sm">
                              <span>∞</span>
                            </div>
                          ) : (
                            <TestNumberFormField
                              form={form}
                              name={`variants.${index}.stock`}
                              disabled={loading}
                              inputClassName="h-8"
                            />
                          )}
                          <div className="flex items-center gap-2 pt-2">
                            <Label className="text-sm font-light">
                              Manage Stock?
                            </Label>
                            <SwitchFormField
                              form={form}
                              name={`variants.${index}.manageStock`}
                              disabled={loading}
                            />
                          </div>
                        </div>
                      </div>
                      <CurrencyFormField
                        form={form}
                        name={`variants.${index}.priceInCents`}
                        disabled={loading}
                        label="Price"
                        inputClassName="h-8"
                        className="w-1/5"
                      />
                      <div className="w-1/5 pt-5">
                        <Button
                          variant="destructive"
                          size="icon"
                          type="button"
                          className="h-8 w-8"
                          onClick={() => remove(index)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
