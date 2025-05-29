import type { UseFormReturn } from "react-hook-form";

import type { DiscountFormData } from "~/lib/validators/discount";
import { DateTimeFormField } from "~/components/input/date-time-form-field";
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
