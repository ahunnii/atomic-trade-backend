import type {
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";

import { cn } from "~/lib/utils";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

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
  const [imageCleared, setImageCleared] = useState(false);

  const handleClearImage = () => {
    setPreview(null);
    setImageCleared(true);
    form.setValue(name, null as PathValue<CurrentForm, Path<CurrentForm>>);
    if (onChange) {
      onChange(null);
    }
  };

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
                    setImageCleared(false);
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
              {!preview && currentImageUrl && !imageCleared && (
                <div className="group relative mt-2 h-48 w-48 overflow-hidden rounded">
                  <Image
                    src={currentImageUrl}
                    alt="Preview"
                    className="rounded border object-cover"
                    fill={true}
                  />
                  <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      title="Clear image"
                      type="button"
                      onClick={handleClearImage}
                      className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              )}
              {preview && (
                <div className="group relative mt-2 h-48 w-48 overflow-hidden rounded">
                  <Image
                    src={preview}
                    alt="Preview"
                    className="rounded border object-cover"
                    fill={true}
                  />
                  <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                      title="Clear image"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
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
