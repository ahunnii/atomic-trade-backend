"use client";

import type {
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";

import { toastService } from "@dreamwalker-studios/toasts";

import { useMultiFileUpload } from "~/lib/file-upload/hooks/use-multi-file-upload";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

export interface MultiImageFormFieldRef {
  upload: () => Promise<string[] | null>;
  isUploading: boolean;
}

type Props<CurrentForm extends FieldValues> = {
  form: UseFormReturn<CurrentForm>;

  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  currentImageUrls?: string[];
  onChange?: (file: FileList | null) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputId?: string;
  resetPreview?: boolean;

  route: string;
  apiUrl: string;

  isRequired?: boolean;

  tempName: Path<CurrentForm>;
  name: Path<CurrentForm>;

  imagePrefix?: string;
};

export const MultiImageFormFieldComponent = <CurrentForm extends FieldValues>(
  {
    form,
    name,
    tempName,
    currentImageUrls,
    label,
    description,
    className,
    disabled,
    placeholder,
    onChange,
    onKeyDown,
    inputId,
    route,
    apiUrl,
    imagePrefix,
    isRequired = true,
  }: Props<CurrentForm>,
  ref: React.ForwardedRef<MultiImageFormFieldRef>,
) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [initialImages, setInitialImages] = useState<string[]>(
    currentImageUrls ?? [],
  );

  const [isUploading, setIsUploading] = useState(false);

  const imageUpload = useMultiFileUpload({
    route,
    api: apiUrl,
  });

  const clearPendingImage = (index: number) => {
    // Filter out the preview at the specified index
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);

    // Get current temp files and filter out the one at the specified index
    const currentTempFiles = form.watch(tempName) as FileList;
    if (currentTempFiles) {
      const dataTransfer = new DataTransfer();
      Array.from(currentTempFiles).forEach((file, i) => {
        if (i !== index) {
          dataTransfer.items.add(file);
        }
      });

      // Update the form with the filtered FileList
      form.setValue(
        tempName,
        dataTransfer.files as PathValue<CurrentForm, Path<CurrentForm>>,
      );

      if (onChange) {
        onChange(dataTransfer.files);
      }
    }
  };
  const clearUploadedImage = (index: number) => {
    const currentImages = form.watch(name) as string[];
    const prefix = imagePrefix ?? "";
    const newImages = currentImages
      .filter((_, i) => i !== index)
      .map((image) => `${prefix}${image}`);

    setInitialImages(newImages);
    form.setValue(name, newImages as PathValue<CurrentForm, Path<CurrentForm>>);
  };

  useImperativeHandle(ref, () => ({
    upload: async () => {
      setIsUploading(true);
      const currentImages: string[] = (
        form.watch(name) ?? ([] as string[])
      ).map((img) =>
        typeof img === "string" && imagePrefix && img.startsWith(imagePrefix)
          ? img.substring(imagePrefix.length)
          : img,
      );
      const tempFiles = form.watch(tempName);

      console.log("Current state:", {
        currentImages,
        tempFiles,
        isRequired,
      });

      if (!tempFiles && currentImages.length === 0 && isRequired) {
        toastService.error("Please upload some images");
        return null;
      }

      if (tempFiles && tempFiles.length > 0) {
        try {
          const uploadedNames = await imageUpload.uploadFiles(
            tempFiles as FileList,
          );

          if (!uploadedNames || uploadedNames.length === 0) {
            toastService.error(
              "Error uploading image. No uploaded names returned",
            );
            return null;
          }

          // Update form with new image URLs
          const newImages = [...currentImages, ...uploadedNames];

          form.setValue(
            name,
            newImages as PathValue<CurrentForm, Path<CurrentForm>>,
          );

          // Clear temp files after successful upload
          form.setValue(
            tempName,
            null as PathValue<CurrentForm, Path<CurrentForm>>,
          );

          setIsUploading(false);
          return newImages;
        } catch (error) {
          setIsUploading(false);
          console.error("Upload failed:", error);
          toastService.error("Failed to upload images");
          return null;
        }
      } else {
        setIsUploading(false);
        return currentImages;
      }
    },

    isUploading: isUploading || imageUpload.isUploading,
  }));

  useEffect(() => {
    console.log("Previews:", previews);
  }, [previews]);
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
                multiple={true}
                disabled={disabled}
                placeholder={placeholder ?? ""}
                {...fieldProps}
                value=""
                onChange={(e) => {
                  console.log("File input changed:", e.target.files);
                  const files = e.target.files;

                  if (files && files.length > 0) {
                    // Convert FileList to array and set in form
                    const fileArray = Array.from(files);
                    console.log("Setting files in form:", fileArray);
                    fieldOnChange(fileArray);
                    if (onChange) onChange(files);

                    // Don't clear existing previews, append to them instead

                    // Create previews
                    fileArray.forEach((file) => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPreviews((prev) => [
                          ...prev,
                          reader.result as string,
                        ]);
                      };
                      reader.readAsDataURL(file);
                    });
                  } else {
                    console.log("No files selected, clearing form");
                    fieldOnChange(null);
                    if (onChange) onChange(null);
                    // Don't clear previews when no files are selected
                  }
                }}
                onKeyDown={onKeyDown}
                id={inputId}
              />

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {initialImages?.map((preview, idx) => (
                  <div
                    className="group relative aspect-square overflow-hidden rounded-md border shadow-sm transition-all hover:shadow-md"
                    key={preview}
                  >
                    <Image
                      src={preview}
                      alt="Preview"
                      className="object-cover"
                      fill={true}
                    />
                    <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => clearUploadedImage(idx)}
                        className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:outline-none"
                        title="Remove image"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}

                {previews.map((preview, idx) => (
                  <div
                    className="group relative aspect-square overflow-hidden rounded-md border shadow-sm transition-all hover:shadow-md"
                    key={preview}
                  >
                    <Image
                      src={preview}
                      alt="Preview"
                      className="object-cover"
                      fill={true}
                    />
                    <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => clearPendingImage(idx)}
                        className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:outline-none"
                        title="Remove image"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
MultiImageFormFieldComponent.displayName = "MultiImageFormField";

export const MultiImageFormField = forwardRef(MultiImageFormFieldComponent) as <
  CurrentForm extends FieldValues,
>(
  props: Props<CurrentForm> & {
    ref?: React.ForwardedRef<MultiImageFormFieldRef>;
  },
) => React.ReactElement;
