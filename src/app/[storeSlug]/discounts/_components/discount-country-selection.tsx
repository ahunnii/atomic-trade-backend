import type { UseFormReturn } from "react-hook-form";

import { init } from "@paralleldrive/cuid2";

import type { DiscountFormData } from "~/lib/validators/discount";
import { DiscountAmountType } from "~/types/discount";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { CheckboxGroupFormField } from "~/components/input/checkbox-group-form-field";
import { CurrencyFormField } from "~/components/input/currency-form-field";
import { DateTimeFormField } from "~/components/input/date-time-form-field";
import { InputFormField } from "~/components/input/input-form-field";
import { RadioGroupFormField } from "~/components/input/radio-group-form-field";
import { SingleCheckboxFormField } from "~/components/input/single-checkbox-form-field";
import { TestNumberFormField } from "~/components/input/test-number-form-field";
import { FormCardSection } from "~/components/shared/form-card-section";

type Props = {
  form: UseFormReturn<DiscountFormData>;
};

const countries = [
  { id: "US", name: "United States" },
  { id: "CA", name: "Canada" },
  { id: "MX", name: "Mexico" },
];

export const DiscountCountrySelection = ({ form }: Props) => {
  return (
    <FormCardSection title="Country">
      <RadioGroupFormField
        form={form}
        name="shippingCountryRequirementType"
        label="Shipping country requirement type"
        description="If true, the discount will be applied to all countries"
        values={[
          { value: "ALL", label: "All" },
          { value: "SPECIFIC", label: "Specific" },
        ]}
        onChange={(value) => {
          if (value === "ALL") {
            form.setValue("applyToAllCountries", true);
            form.setValue("shippingCountryRequirementType", "ALL");
          } else {
            form.setValue("applyToAllCountries", false);
            form.setValue("shippingCountryRequirementType", "SPECIFIC");
          }
        }}
      />

      {form.watch("shippingCountryRequirementType") === "SPECIFIC" && (
        <CheckboxGroupFormField
          form={form}
          name="countryCodes"
          label="Country codes"
          description="The country codes the discount will be applied to"
          items={countries.map((country) => ({
            id: country.id,
            label: country.name,
          }))}
        />
      )}
    </FormCardSection>
  );
};
