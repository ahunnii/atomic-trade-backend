import type { UseFormReturn } from "react-hook-form";

import { init } from "@paralleldrive/cuid2";

import type { DiscountFormData } from "~/lib/validators/discount";
import { Button } from "~/components/ui/button";
import { InputFormField } from "~/components/input/input-form-field";
import { RadioGroupFormField } from "~/components/input/radio-group-form-field";
import { FormCardSection } from "~/components/shared/form-card-section";

type Props = {
  form: UseFormReturn<DiscountFormData>;
};

const createId = init({
  length: 10,
});
export const DiscountAmountSection = ({ form }: Props) => {
  const currentMethod = form.watch("isAutomatic");

  const generateRandomCode = () => {
    const id = createId().toUpperCase();
    form.setValue("code", id);
  };

  return (
    <FormCardSection title="Discount Amount">
      <RadioGroupFormField
        form={form}
        name="isAutomatic"
        defaultValue={currentMethod ? "true" : "false"}
        label="Discount method"
        values={[
          { label: "Discount via sale", value: "true" },
          { label: "Discount via code", value: "false" },
        ]}
        onChange={(value) => {
          form.setValue("isAutomatic", value === "true");
        }}
      />

      <div className="flex flex-col gap-4">
        <InputFormField
          form={form}
          name="code"
          label={!!currentMethod ? "Title" : "Discount code"}
          placeholder={
            currentMethod ? "Enter discount title" : "Enter discount code"
          }
          description={
            currentMethod
              ? "This will be displayed to customers"
              : "This will be used to apply the discount"
          }
        />

        <Button variant="outline" onClick={generateRandomCode} type="button">
          Generate random code
        </Button>
      </div>
    </FormCardSection>
  );
};
