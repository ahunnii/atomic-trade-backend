import type { UseFormReturn } from "react-hook-form";
import { useMemo, useState } from "react";
import Image from "next/image";
import { PencilIcon } from "lucide-react";

import { type ColumnDef } from "@tanstack/react-table";

import type { ProductFormData } from "~/lib/validators/product";
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
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

type CollectionSelectionColumn = {
  id: string;
  storeSlug: string;
  name: string;
  imageUrl: string;

  status: string;
};

const collectionSelectionColumnData: ColumnDef<CollectionSelectionColumn>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="border-border relative aspect-square h-10 overflow-hidden rounded-md border shadow-sm transition-shadow group-hover:shadow-md">
          <Image
            src={`${env.NEXT_PUBLIC_STORAGE_URL}/misc/${row.original.imageUrl ?? "placeholder-image.webp"}`}
            fill
            className="rounded-md object-cover"
            alt={`Image for ${row.original.name}`}
          />
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="group-hover:text-primary text-sm font-medium transition-colors">
            {row.original.name}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <>{row.original.status}</>,
  },
];

export const CollectionSelection = ({
  form,
  isLoading,
  collections,
  storeSlug,
}: {
  form: UseFormReturn<ProductFormData>;
  isLoading: boolean;
  collections: Collection[];
  storeSlug: string;
}) => {
  const [selectedCollections, setSelectedCollections] = useState<
    {
      [key: string]: unknown;
      id: string;
    }[]
  >(
    form
      .getValues("collections")
      ?.map((collection) => ({
        ...collection,
        id: collection?.id ?? "",
      }))
      .filter((collection) => collection.id !== "") ?? [],
  );

  const columnData = useMemo(() => {
    return collections.map((collection) => ({
      ...collection,
      storeSlug,
    }));
  }, [collections, storeSlug]);

  const selectedIds = useMemo(() => {
    return selectedCollections.map((collection) => collection.id);
  }, [selectedCollections]);

  return (
    <div className="col-span-full">
      <Dialog>
        <DialogTrigger asChild disabled={isLoading}>
          <div
            onClick={() => {
              setSelectedCollections(form.getValues("collections"));
            }}
            className="hover:bg-accent/50 flex cursor-pointer items-center justify-between rounded-md border border-dashed p-3 transition-all hover:border-solid"
          >
            <div className="space-y-1">
              <h3 className="flex items-center text-base font-semibold">
                Manage Collections
                {form.watch("collections")?.length > 0 && (
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-100">
                    {form.watch("collections").length} selected
                  </span>
                )}
              </h3>
              <p className="text-muted-foreground text-sm">
                {form.watch("collections")?.length > 0
                  ? "Click to edit the collections for this product"
                  : "No collections added yet. Add collections to include this product in."}
              </p>
            </div>
            <div className="bg-primary/10 ml-auto rounded-full p-2">
              <PencilIcon className="text-primary h-4 w-4" />
            </div>
          </div>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-2xl"
          withoutClose={true}
          onInteractOutside={() => {
            setSelectedCollections(form.getValues("collections"));
          }}
        >
          <DialogHeader>
            <div className="flex items-center justify-between pb-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedCollections(form.getValues("collections"));
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      form.setValue(
                        "collections",
                        selectedCollections as Collection[],
                      );
                    }}
                  >
                    Add Collections
                  </Button>
                </DialogClose>
              </div>
            </div>
            <DialogTitle>Manage Collections</DialogTitle>
            <DialogDescription>
              Add this product to collections here.
            </DialogDescription>
          </DialogHeader>

          <div className="my-5 w-full gap-8 md:grid md:grid-cols-1">
            {collections?.length === 0 && (
              <div className="flex items-center justify-center">
                <p className="text-muted-foreground text-sm">
                  No collections added yet. Add collections to include this
                  product in.
                </p>
              </div>
            )}
            {collections?.length > 0 && (
              <AdvancedDataTable
                columns={collectionSelectionColumnData}
                setSelectedData={(data) => {
                  setSelectedCollections(data);
                }}
                postSelectAccessor="id"
                preSelectAccessor="id"
                data={columnData}
                searchKey="name"
                preSelectedDataIds={selectedIds}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
