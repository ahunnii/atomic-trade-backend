import Image from "next/image";
import { useState } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

type Props<CurrentForm extends FieldValues> = {
  form: UseFormReturn<CurrentForm>;
  name: Path<CurrentForm>;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  currentImageUrl?: string;
  onChange?: (file: File | null) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputId?: string;
  resetPreview?: boolean;
};

export const ImageFormField = <CurrentForm extends FieldValues>({
  form,
  name,
  currentImageUrl,
  label,
  description,
  className,
  disabled,
  placeholder,
  onChange,
  onKeyDown,
  inputId,
}: Props<CurrentForm>) => {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({
        field: { onChange: fieldOnChange, value: _value, ...fieldProps },
      }) => (
        <FormItem className={cn("col-span-full", className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div className="flex flex-col">
              <Input
                type="file"
                accept="image/*"
                disabled={disabled}
                placeholder={placeholder ?? ""}
                {...fieldProps}
                value=""
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  fieldOnChange(file);
                  if (onChange) {
                    onChange(file);
                  }
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setPreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setPreview(null);
                  }
                }}
                onKeyDown={onKeyDown}
                id={inputId}
              />
              {!preview && currentImageUrl && (
                <div className="relative mt-2 h-48 w-48 overflow-hidden rounded">
                  <Image
                    src={currentImageUrl}
                    alt="Preview"
                    className="rounded border object-cover"
                    fill={true}
                  />
                </div>
              )}
              {preview && (
                <div className="relative mt-2 h-48 w-48 overflow-hidden rounded">
                  <Image
                    src={preview}
                    alt="Preview"
                    className="rounded border object-cover"
                    fill={true}
                  />
                </div>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
