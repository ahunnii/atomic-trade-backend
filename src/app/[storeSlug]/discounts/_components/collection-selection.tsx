import type { UseFormReturn } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { PencilIcon } from "lucide-react";

import type { DiscountFormData } from "~/lib/validators/discount";
import type { Collection } from "~/types/collection";
import { env } from "~/env";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

type CollectionWithSelection = Collection & {
  isSelected: boolean;
};

export const CollectionSelection = ({
  form,
  isLoading,
  collections,
}: {
  form: UseFormReturn<DiscountFormData>;
  isLoading: boolean;
  collections: Collection[];
}) => {
  const [selectedCollections, setSelectedCollections] = useState<
    CollectionWithSelection[]
  >([]);

  // Initialize selection state from form data
  useEffect(() => {
    const selectedCollectionIds = new Set(
      form.getValues("collections").map((c) => c.id),
    );

    setSelectedCollections(
      collections.map((collection) => ({
        ...collection,
        isSelected: selectedCollectionIds.has(collection.id),
      })),
    );
  }, [collections, form]);

  const toggleCollectionSelection = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.map((collection) => {
        if (collection.id === collectionId) {
          return {
            ...collection,
            isSelected: !collection.isSelected,
          };
        }
        return collection;
      }),
    );
  };

  const selectedCollectionCount = useMemo(() => {
    return selectedCollections.filter((c) => c.isSelected).length;
  }, [selectedCollections]);

  const handleSave = () => {
    const selectedIds = selectedCollections
      .filter((collection) => collection.isSelected)
      .map((collection) => ({ id: collection.id }));

    form.setValue("collections", selectedIds);
  };

  const handleCancel = () => {
    // Reset to form values
    const selectedCollectionIds = new Set(
      form.getValues("collections").map((c) => c.id),
    );

    setSelectedCollections(
      collections.map((collection) => ({
        ...collection,
        isSelected: selectedCollectionIds.has(collection.id),
      })),
    );
  };

  return (
    <div className="col-span-full">
      <Dialog>
        <DialogTrigger asChild disabled={isLoading}>
          <div className="hover:bg-accent/50 flex cursor-pointer items-center justify-between rounded-md border border-dashed p-3 transition-all hover:border-solid">
            <div className="space-y-1">
              <h3 className="flex items-center text-base font-semibold">
                Manage Collections
                {selectedCollectionCount > 0 && (
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-100">
                    {selectedCollectionCount} selected
                  </span>
                )}
              </h3>
              <p className="text-muted-foreground text-sm">
                {selectedCollectionCount > 0
                  ? "Click to edit the selected collections"
                  : "No collections selected. Select collections to apply the discount."}
              </p>
            </div>
            <div className="bg-primary/10 ml-auto rounded-full p-2">
              <PencilIcon className="text-primary h-4 w-4" />
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <div className="flex items-center justify-between pb-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </DialogClose>
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button type="button" size="sm" onClick={handleSave}>
                    Save Selection
                  </Button>
                </DialogClose>
              </div>
            </div>
            <DialogTitle>Select Collections</DialogTitle>
            <DialogDescription>
              Select collections to apply the discount to.
            </DialogDescription>
          </DialogHeader>

          <div className="my-5 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              {selectedCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <Checkbox
                    checked={collection.isSelected}
                    onCheckedChange={() =>
                      toggleCollectionSelection(collection.id)
                    }
                  />

                  <div className="flex items-center gap-2">
                    <div className="border-border relative aspect-square h-10 overflow-hidden rounded-md border">
                      <Image
                        src={`${env.NEXT_PUBLIC_STORAGE_URL}/misc/${collection.imageUrl ?? "placeholder-image.webp"}`}
                        fill
                        className="object-cover"
                        alt={`Image for ${collection.name}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{collection.name}</h4>
                      <p className="text-muted-foreground text-sm">
                        {collection.description ?? "No description"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
