import type { UseFormReturn } from "react-hook-form";
import { useRef } from "react";
import { PencilIcon } from "lucide-react";

import type { OutputData } from "@editorjs/editorjs";

import type { LargeMarkdownFormFieldRef } from "~/components/input/large-markdown-form-field";
import type { ProductFormData } from "~/lib/validators/product";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { InputFormField } from "~/components/input/input-form-field";
import { LargeMarkdownFormField } from "~/components/input/large-markdown-form-field";
import { TextareaFormField } from "~/components/input/textarea-form-field";
import { FormSection } from "~/components/shared/form-section";

type Props = {
  form: UseFormReturn<ProductFormData>;
  loading: boolean;
};

export const ProductDetailsSection = ({ form, loading }: Props) => {
  const editorRef = useRef<LargeMarkdownFormFieldRef>(null);
  return (
    <FormSection
      title="Details"
      description="To start selling, all you need is a name and a price."
      bodyClassName="space-y-4"
    >
      <div className="my-5 grid gap-4 md:grid-cols-2 md:gap-8">
        <InputFormField
          form={form}
          name="name"
          disabled={loading}
          label="Product Name"
          placeholder="e.g. T-Shirt"
        />

        <TextareaFormField
          form={form}
          disabled={loading}
          name="description"
          label="Description"
          placeholder="e.g. This is a description of the product."
        />

        <div className="col-span-full">
          <Dialog>
            <DialogTrigger asChild>
              <div className="hover:bg-accent/50 flex cursor-pointer items-center justify-between rounded-md border border-dashed p-3 transition-all hover:border-solid">
                <div className="space-y-1">
                  <h3 className="flex items-center text-base font-semibold">
                    Additional Information (Optional)
                    {!!form.watch("additionalInfo") && (
                      <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-100">
                        Added
                      </span>
                    )}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {!!form.watch("additionalInfo")
                      ? "Click to edit your product's detailed description"
                      : "No additional information added yet. Add more detail to your product page using custom blocks and fields."}
                  </p>
                </div>
                <div className="bg-primary/10 ml-auto rounded-full p-2">
                  <PencilIcon className="text-primary h-4 w-4" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl" withoutClose={true}>
              <DialogHeader>
                <div className="flex items-center justify-between pb-4">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        editorRef.current?.render(
                          (form.watch("additionalInfo") ?? {}) as OutputData,
                        )
                      }
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="px-3"
                      variant="outline"
                      onClick={() =>
                        editorRef.current?.render(
                          (form.watch("additionalInfo") ?? {}) as OutputData,
                        )
                      }
                    >
                      Reset
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="px-3"
                      variant="outline"
                      onClick={() => editorRef.current?.clear()}
                    >
                      Clear
                    </Button>

                    <DialogClose asChild>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => void editorRef.current?.save()}
                      >
                        Apply
                      </Button>
                    </DialogClose>
                  </div>
                </div>
                <DialogTitle>Additional Information</DialogTitle>
                <DialogDescription>
                  Put additional info on your product page: a longer
                  description, frequently asked questions, care instructions,
                  videos, or other content.
                </DialogDescription>
              </DialogHeader>
              <div className="my-5 w-full gap-8 md:grid md:grid-cols-1">
                <LargeMarkdownFormField
                  form={form}
                  ref={editorRef}
                  contentFieldName="additionalInfo"
                  className="col-span-full w-full"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </FormSection>
  );
};
