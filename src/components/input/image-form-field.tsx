import type {
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";

import { toastService } from "@dreamwalker-studios/toasts";

import { useFileUpload } from "~/lib/file-upload/hooks/use-file-upload";
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

export interface ImageFormFieldRef {
  upload: () => Promise<string | null>;
  isUploading: boolean;
}

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

  isRequired?: boolean;
  route: string;
  apiUrl: string;

  tempName: Path<CurrentForm>;
};

export const ImageFormFieldComponent = <CurrentForm extends FieldValues>(
  {
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
    isRequired,
    route,
    apiUrl,
    tempName,
  }: Props<CurrentForm>,
  ref: React.ForwardedRef<ImageFormFieldRef>,
) => {
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

  const imageUpload = useFileUpload({
    route,
    api: apiUrl,
  });

  useImperativeHandle(ref, () => ({
    upload: async () => {
      const currentImage: string | null = form.watch(name) ?? null;
      const tempFile = form.watch(tempName);

      console.log("Current state:", {
        currentImage,
        tempFile,
        isRequired,
      });

      if (!tempFile && !currentImage && isRequired) {
        toastService.error("This image is required");
        return null;
      }

      if (tempFile) {
        const uploadedImage = await imageUpload.uploadFile(tempFile as File);

        if (!uploadedImage) {
          toastService.error("Error uploading image");
          return null;
        }

        form.setValue(
          name,
          uploadedImage as PathValue<CurrentForm, Path<CurrentForm>>,
        );
        return uploadedImage;
      }
      return null;
    },

    isUploading: imageUpload.isUploading,
  }));

  return (
    <FormField
      control={form.control}
      name={tempName}
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

ImageFormFieldComponent.displayName = "ImageFormField";

export const ImageFormField = forwardRef(ImageFormFieldComponent) as <
  CurrentForm extends FieldValues,
>(
  props: Props<CurrentForm> & {
    ref?: React.ForwardedRef<ImageFormFieldRef>;
  },
) => React.ReactElement;
