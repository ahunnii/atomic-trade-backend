import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";

import { cn } from "~/lib/utils";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

import { PhoneInput } from "../ui/custom/phone-input";

type Props<CurrentForm extends FieldValues> = {
  form: UseFormReturn<CurrentForm>;
  name: Path<CurrentForm>;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputId?: string;
};

export const PhoneFormField = <CurrentForm extends FieldValues>({
  form,
  name,
  label,
  description,
  className,
  disabled,
  placeholder,
  onChange,
  onKeyDown,
  inputId,
}: Props<CurrentForm>) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("col-span-full", className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <PhoneInput
              disabled={disabled}
              placeholder={placeholder ?? ""}
              {...field}
              // value={field.value ? `+${field.value}` : ""}
              onChange={(e) => {
                if (!!onChange) {
                  onChange(e as string);
                }
                field.onChange(e as string);
              }}
              onKeyDown={onKeyDown}
              id={inputId}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
