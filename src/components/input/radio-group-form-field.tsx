"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { cn } from "~/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

type Props<CurrentForm extends FieldValues> = {
  form: UseFormReturn<CurrentForm>;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (value: string | boolean) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputId?: string;
  inputClassName?: string;
  name: Path<CurrentForm>;
  defaultValue?: string;
  values: {
    label: string;
    value: string;
  }[];
};

export const RadioGroupFormField = <CurrentForm extends FieldValues>({
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
  inputClassName,
  defaultValue,
  values,
}: Props<CurrentForm>) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("col-span-full space-y-3", className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <RadioGroup
              onValueChange={(value) => {
                if (onChange) {
                  onChange(value);
                } else {
                  field.onChange(value);
                }
              }}
              defaultValue={defaultValue ?? field.value}
              disabled={disabled}
              className="flex flex-col space-y-1"
            >
              {values?.map((value) => (
                <FormItem
                  key={value.value}
                  className="flex items-center space-y-0 space-x-3"
                >
                  <FormControl>
                    <RadioGroupItem value={value.value} />
                  </FormControl>
                  <FormLabel className="font-normal">{value.label}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
