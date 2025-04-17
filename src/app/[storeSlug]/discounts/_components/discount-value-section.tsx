import type { UseFormReturn } from "react-hook-form";

import { init } from "@paralleldrive/cuid2";

import type { DiscountFormData } from "~/lib/validators/discount";
import type { Collection } from "~/types/collection";
import type { Product } from "~/types/product";
import { DiscountAmountType, DiscountType } from "~/types/discount";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { CurrencyFormField } from "~/components/input/currency-form-field";
import { InputFormField } from "~/components/input/input-form-field";
import { RadioGroupFormField } from "~/components/input/radio-group-form-field";
import { SingleCheckboxFormField } from "~/components/input/single-checkbox-form-field";
import { FormCardSection } from "~/components/shared/form-card-section";

import { CollectionSelection } from "./collection-selection";
import { ProductVariantSelection } from "./product-variant-selection";

type Props = {
  form: UseFormReturn<DiscountFormData>;
  products: Product[];
  collections: Collection[];
  isLoading: boolean;
};

export const DiscountValueSection = ({
  form,
  products,
  collections,
  isLoading,
}: Props) => {
  const amountType = form.watch("amountType");
  const discountType = form.watch("type");

  const handleAmountTypeChange = (value: string) => {
    form.setValue("amountType", value as DiscountAmountType);
  };

  return (
    <FormCardSection title="How much?">
      <div className="flex flex-row gap-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            type="button"
            className={cn(
              amountType === DiscountAmountType.PERCENTAGE &&
                "bg-primary text-primary-foreground",
            )}
            onClick={() =>
              handleAmountTypeChange(DiscountAmountType.PERCENTAGE)
            }
          >
            Percentage (%)
          </Button>
          <Button
            variant="outline"
            type="button"
            className={cn(
              amountType === DiscountAmountType.FIXED &&
                "bg-primary text-primary-foreground",
            )}
            onClick={() => handleAmountTypeChange(DiscountAmountType.FIXED)}
          >
            Fixed amount ($)
          </Button>
        </div>

        {amountType === DiscountAmountType.PERCENTAGE && (
          <InputFormField form={form} name="amount" placeholder="e.g. 15" />
        )}

        {amountType === DiscountAmountType.FIXED && (
          <CurrencyFormField
            form={form}
            name="amount"
            placeholder="e.g. 15.00"
          />
        )}
      </div>

      {discountType === DiscountType.PRODUCT && (
        <>
          <div className="col-span-full">
            <SingleCheckboxFormField
              form={form}
              name="applyToAllProducts"
              label="Apply to all products"
              description="When checked, this discount will apply to all products in your store, regardless of any specific product or collection selections below."
            />
          </div>

          <div className="col-span-full my-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background text-muted-foreground px-2">
                  Select products or collections below
                </span>
              </div>
            </div>
          </div>
          <ProductVariantSelection
            form={form}
            isLoading={isLoading}
            products={products ?? []}
          />
          <CollectionSelection
            form={form}
            isLoading={isLoading}
            collections={collections ?? []}
          />
        </>
      )}
    </FormCardSection>
  );
};
