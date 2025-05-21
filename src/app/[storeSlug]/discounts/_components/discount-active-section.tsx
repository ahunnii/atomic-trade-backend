import type { UseFormReturn } from "react-hook-form";

import { init } from "@paralleldrive/cuid2";

import type { DiscountFormData } from "~/lib/validators/discount";
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

export const DiscountActiveSection = ({ form }: Props) => {
  return (
    <FormCardSection title="Active">
      <DateTimeFormField
        form={form}
        name="startsAt"
        label="Starts at"
        description="The date and time the discount will start"
      />

      <DateTimeFormField
        form={form}
        name="endsAt"
        label="Ends at"
        description="The date and time the discount will end"
      />
    </FormCardSection>
  );
};
