import type { UseFormReturn } from "react-hook-form";
import { useMemo, useState } from "react";
import Image from "next/image";
import { PencilIcon } from "lucide-react";

import { type ColumnDef } from "@tanstack/react-table";

import type { CollectionFormData } from "~/lib/validators/collection";
import type { ProductWithVariations } from "~/types/product";
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

type ProductSelectionColumn = {
  id: string;
  storeSlug: string;
  name: string;
  featuredImage: string;
  variants: number;
  status: string;
};

const productSelectionColumnData: ColumnDef<ProductSelectionColumn>[] = [
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
            src={`${env.NEXT_PUBLIC_STORAGE_URL}/products/${row.original.featuredImage ?? "placeholder-image.webp"}`}
            fill
            className="rounded-md object-cover"
            alt={`Image for ${row.original.name}`}
          />
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="group-hover:text-primary text-sm font-medium transition-colors">
            {row.original.name}
          </span>
          <span className="text-muted-foreground max-w-[200px] truncate text-xs">
            {row.original.variants} variants
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

export const ProductSelection = ({
  form,
  isLoading,
  products,
  storeSlug,
}: {
  form: UseFormReturn<CollectionFormData>;
  isLoading: boolean;
  products: ProductWithVariations[];
  storeSlug: string;
}) => {
  const [selectedProducts, setSelectedProducts] = useState<
    {
      [key: string]: unknown;
      id: string;
    }[]
  >(
    form
      .getValues("products")
      ?.map((product) => ({
        ...product,
        id: product?.id ?? "",
      }))
      .filter((product) => product.id !== "") ?? [],
  );

  const columnData = useMemo(() => {
    return products.map((product) => ({
      ...product,
      variants: product.variants.length,
      storeSlug,
    }));
  }, [products, storeSlug]);

  const selectedIds = useMemo(() => {
    return selectedProducts.map((product) => product.id);
  }, [selectedProducts]);

  return (
    <div className="col-span-full">
      <Dialog>
        <DialogTrigger asChild disabled={isLoading}>
          <div className="hover:bg-accent/50 flex cursor-pointer items-center justify-between rounded-md border border-dashed p-3 transition-all hover:border-solid">
            <div className="space-y-1">
              <h3 className="flex items-center text-base font-semibold">
                Manage Products
                {form.watch("products").length > 0 && (
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-100">
                    {form.watch("products").length} selected
                  </span>
                )}
              </h3>
              <p className="text-muted-foreground text-sm">
                {form.watch("products").length > 0
                  ? "Click to edit the products in this collection"
                  : "No products added yet. Add products to include in this collection."}
              </p>
            </div>
            <div className="bg-primary/10 ml-auto rounded-full p-2">
              <PencilIcon className="text-primary h-4 w-4" />
            </div>
          </div>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-5xl"
          withoutClose={true}
          onInteractOutside={() => {
            setSelectedProducts(form.getValues("products"));
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
                    setSelectedProducts(form.getValues("products"));
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
                      form.setValue("products", selectedProducts);
                    }}
                  >
                    Add Products
                  </Button>
                </DialogClose>
              </div>
            </div>
            <DialogTitle>Manage Products</DialogTitle>
            <DialogDescription>
              Add products to your collection here.
            </DialogDescription>
          </DialogHeader>

          <div className="my-5 w-full gap-8 md:grid md:grid-cols-1">
            <AdvancedDataTable
              columns={productSelectionColumnData}
              setSelectedData={(data) => {
                setSelectedProducts(data);
              }}
              postSelectAccessor="id"
              preSelectAccessor="id"
              data={columnData}
              searchKey="name"
              preSelectedDataIds={selectedIds}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
