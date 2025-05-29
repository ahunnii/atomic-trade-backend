import type { UseFormReturn } from "react-hook-form";

import type { DiscountFormData } from "~/lib/validators/discount";
import { SingleCheckboxFormField } from "~/components/input/single-checkbox-form-field";
import { FormCardSection } from "~/components/shared/form-card-section";

type Props = {
  form: UseFormReturn<DiscountFormData>;
};

export const DiscountCombosSection = ({ form }: Props) => {
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
