import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";

import type { Item } from "~/components/ui/custom/draggable-list";
import type { ProductFormData } from "~/lib/validators/product";
import { Button } from "~/components/ui/button";
import { DraggableList } from "~/components/ui/custom/draggable-list";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import { generateVariants } from "../_utils/generate-variants";
import { ManageVariationsButton } from "./manage-variations-button";

type Props = {
  form: UseFormReturn<ProductFormData>;
  loading: boolean;
};

export const ProductAttributeDialog = ({ form, loading }: Props) => {
  const { fields, replace } = useFieldArray({
    control: form.control,
    name: `attributes` as const,
  });

  const variantCount = form.watch("variants").length;

  const handleItemsChange = (newItems: Item[]) => {
    replace(
      newItems.map((item) => ({
        id: item.id,
        name: item.name,
        values: item.values,
      })),
    );
  };

  const DialogButton =
    variantCount > 1 ? ManageAttributesButton : ManageVariationsButton;

  return (
    <div className="col-span-full">
      <Dialog>
        <DialogTrigger asChild disabled={loading}>
          <div>
            <DialogButton variantCount={variantCount} />
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
                    form.setValue(
                      "attributes",
                      (form.formState.defaultValues?.attributes as Item[]) ??
                        [],
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
                    form.setValue(
                      "attributes",
                      (form.formState.defaultValues?.attributes as Item[]) ??
                        [],
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
                  onClick={() => form.setValue("attributes", [])}
                >
                  Clear
                </Button>

                <DialogClose asChild>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const variants = generateVariants(
                        form.getValues("attributes"),
                        form.getValues("variants"),
                      );

                      form.setValue("variants", variants);
                    }}
                  >
                    Apply
                  </Button>
                </DialogClose>
              </div>
            </div>
            <DialogTitle>Add Product Attributes</DialogTitle>
            <DialogDescription>
              Product options allow you to sell different versions of the same
              product, like clothes in different colors or sizes.
            </DialogDescription>
          </DialogHeader>
          <div className="my-5 w-full gap-8 md:grid md:grid-cols-1">
            <DraggableList
              items={fields.map((field) => ({
                id: field.id,
                name: field.name || "",
                values: field.values || [],
              }))}
              setItems={handleItemsChange}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ManageAttributesButton = () => {
  return (
    <Button variant="default" size="sm" className="px-3" type="button">
      Manage Attributes
    </Button>
  );
};
