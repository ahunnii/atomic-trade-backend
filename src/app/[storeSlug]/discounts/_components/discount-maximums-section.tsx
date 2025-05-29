import type { UseFormReturn } from "react-hook-form";

import type { DiscountFormData } from "~/lib/validators/discount";
import { CheckboxGroupFormField } from "~/components/input/checkbox-group-form-field";
import { TestNumberFormField } from "~/components/input/test-number-form-field";
import { FormCardSection } from "~/components/shared/form-card-section";

type Props = {
  form: UseFormReturn<DiscountFormData>;
};

export const DiscountMaximumsSection = ({ form }: Props) => {
  const maximumRequirementType = form.watch("maximumRequirementType");

  return (
    <FormCardSection title="Maximums">
      <CheckboxGroupFormField
        form={form}
        name="maximumRequirementType"
        // label="Maximums"
        items={[
          // { label: "No maximums required", id: "NONE" },
          { label: "Maximum uses", id: "USES" },
          { label: "Limit once per customer", id: "CUSTOMER" },
        ]}
      />

      <div className="flex flex-row gap-4">
        {maximumRequirementType?.includes("USES") && (
          <TestNumberFormField
            form={form}
            name="maximumUses"
            placeholder="e.g. 15"
          />
        )}
      </div>
    </FormCardSection>
  );
};
