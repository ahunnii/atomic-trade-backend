import type { UseFormReturn } from "react-hook-form";

import type { ProductFormData } from "~/lib/validators/product";
import { CurrencyFormField } from "~/components/input/currency-form-field";
import { InputFormField } from "~/components/input/input-form-field";
import { SwitchFormField } from "~/components/input/switch-form-field";
import { TestNumberFormField } from "~/components/input/test-number-form-field";
import { FormSection } from "~/components/shared/form-section";

import { ProductAttributeDialog } from "./product-attribute-dialog";
import { VariantSection } from "./variant-section";

type Props = {
  form: UseFormReturn<ProductFormData>;
  loading: boolean;
};

export const ProductInventorySection = ({ form, loading }: Props) => {
  const variantCount = form.watch("variants").length;

  return (
    <FormSection
      title="Inventory"
      description="Add inventory details to your product."
      bodyClassName="space-y-4"
    >
      {variantCount > 1 ? (
        <div className="my-5 gap-8 md:grid md:grid-cols-2">
          <VariantSection form={form} loading={loading} />
        </div>
      ) : (
        <div className="my-5 gap-8 md:grid md:grid-cols-2">
          <CurrencyFormField
            form={form}
            name="variants.0.priceInCents"
            disabled={loading}
            label="Price"
            placeholder="e.g. 100"
          />

          <SwitchFormField
            form={form}
            name="variants.0.manageStock"
            disabled={loading}
            label="Manage Stock"
          />

          {!form.watch("variants.0.manageStock") ? (
            <div className="col-span-full flex w-full flex-col space-y-2">
              <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Quantity
              </label>
              <div className="border-input bg-background flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>∞</span>
                <span className="text-muted-foreground text-xs">
                  Unlimited stock
                </span>
              </div>
              {/* <p className="text-muted-foreground text-sm">
              Stock management is disabled. Products will always be available.
            </p> */}
            </div>
          ) : (
            <TestNumberFormField
              form={form}
              name="variants.0.stock"
              disabled={loading}
              label="Stock"
              placeholder="e.g. 100"
            />
          )}

          <InputFormField
            form={form}
            name="variants.0.sku"
            disabled={loading}
            label="SKU (Optional)"
            placeholder="e.g. AT-123456"
          />

          <ProductAttributeDialog form={form} loading={loading} />
        </div>
      )}
    </FormSection>
  );
};
