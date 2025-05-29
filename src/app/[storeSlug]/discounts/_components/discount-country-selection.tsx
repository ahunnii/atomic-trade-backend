import type { UseFormReturn } from "react-hook-form";

import type { DiscountFormData } from "~/lib/validators/discount";
import { CheckboxGroupFormField } from "~/components/input/checkbox-group-form-field";
import { RadioGroupFormField } from "~/components/input/radio-group-form-field";
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
