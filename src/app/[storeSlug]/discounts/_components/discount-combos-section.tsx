import type { UseFormReturn } from "react-hook-form";

import { init } from "@paralleldrive/cuid2";

import type { DiscountFormData } from "~/lib/validators/discount";
import { DiscountAmountType } from "~/types/discount";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { CheckboxGroupFormField } from "~/components/input/checkbox-group-form-field";
import { CurrencyFormField } from "~/components/input/currency-form-field";
import { InputFormField } from "~/components/input/input-form-field";
import { RadioGroupFormField } from "~/components/input/radio-group-form-field";
import { SingleCheckboxFormField } from "~/components/input/single-checkbox-form-field";
import { TestNumberFormField } from "~/components/input/test-number-form-field";
import { FormCardSection } from "~/components/shared/form-card-section";

type Props = {
  form: UseFormReturn<DiscountFormData>;
};

export const DiscountCombosSection = ({ form }: Props) => {
  const maximumRequirementType = form.watch("maximumRequirementType");

  return (
    <FormCardSection title="Combinations">
      <SingleCheckboxFormField
        form={form}
        name="combineWithProductDiscounts"
        label="Combine with product discounts"
      />

      <SingleCheckboxFormField
        form={form}
        name="combineWithOrderDiscounts"
        label="Combine with order discounts"
      />

      <SingleCheckboxFormField
        form={form}
        name="combineWithShippingDiscounts"
        label="Combine with shipping discounts"
      />
    </FormCardSection>
  );
};
