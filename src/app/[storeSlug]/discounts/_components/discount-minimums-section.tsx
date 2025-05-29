import type { UseFormReturn } from "react-hook-form";
import { useMemo } from "react";

import { DiscountType } from "@prisma/client";

import type { DiscountFormData } from "~/lib/validators/discount";
import { CurrencyFormField } from "~/components/input/currency-form-field";
import { RadioGroupFormField } from "~/components/input/radio-group-form-field";
import { TestNumberFormField } from "~/components/input/test-number-form-field";
import { FormCardSection } from "~/components/shared/form-card-section";

type Props = {
  form: UseFormReturn<DiscountFormData>;
};

export const DiscountMinimumsSection = ({ form }: Props) => {
  const minimumRequirementType = form.watch("minimumRequirementType");
  const discountType = form.watch("type");

  const requirementValues = useMemo(() => {
    if (discountType === DiscountType.PRODUCT) {
      return [
        { label: "Minimum purchase amount", value: "PURCHASE" },
        { label: "Minimum quantity", value: "QUANTITY" },
      ];
    }

    return [
      {
        label: "No minimums required",
        value: "NONE",
      },
      { label: "Minimum purchase amount", value: "PURCHASE" },
      { label: "Minimum quantity", value: "QUANTITY" },
    ];
  }, [discountType]);

  return (
    <FormCardSection title="Minimums">
      <RadioGroupFormField
        form={form}
        name="minimumRequirementType"
        values={requirementValues}
      />

      <div className="flex flex-row gap-4">
        {minimumRequirementType === "QUANTITY" && (
          <TestNumberFormField
            form={form}
            name="minimumQuantity"
            placeholder="e.g. 15"
          />
        )}

        {minimumRequirementType === "PURCHASE" && (
          <CurrencyFormField
            form={form}
            name="minimumPurchaseInCents"
            placeholder="e.g. 15.00"
          />
        )}
      </div>
    </FormCardSection>
  );
};
