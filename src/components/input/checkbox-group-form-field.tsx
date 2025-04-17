/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

import { Checkbox } from "../ui/checkbox";

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
  items: {
    id: string;
    label: string;
  }[];
};

export const CheckboxGroupFormField = <CurrentForm extends FieldValues>({
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
  items,
}: Props<CurrentForm>) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormField
          control={form.control}
          name={name}
          render={() => (
            <FormItem className={cn("col-span-full space-y-3", className)}>
              {(label ?? description) && (
                <div className={cn("mb-4")}>
                  {label && (
                    <FormLabel className="text-base">{label}</FormLabel>
                  )}
                  {description && (
                    <FormDescription>{description}</FormDescription>
                  )}
                </div>
              )}

              {items.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name={name}
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-y-0 space-x-3"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value: string) => value !== item.id,
                                    ),
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    />
  );
};
