/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { format } from "date-fns";

import type { ProductStatus } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";

import { env } from "~/env";
import { CellActions } from "~/components/shared/cell-actions";
import { PrimaryCellLink } from "~/components/shared/primary-cell-link";

export type ProductColumn = {
  id: string;
  storeId: string;
  name: string;
  storeSlug: string;
  updatedAt: Date;
  isFeatured: boolean;
  status: ProductStatus;
  variants: {
    id: string;
    name: string;
    priceInCents: number;
    manageStock: boolean;
    stock: number;
  }[];

  featuredImage?: string | null;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  isLoading: boolean;
};

export const productColumnData: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <PrimaryCellLink
        id={row.original.id}
        image={`${env.NEXT_PUBLIC_STORAGE_URL}/products/${row.original.featuredImage ?? "/placeholder-image.webp"}`}
        name={row.original.name}
        link={`/${row.original.storeSlug}/products/${row.original.id}/edit`}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: (row, id, value) => {
      const key = row.getValue(id);
      return value.includes(key);
    },
    cell: ({ row }) => row.original.status,
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
  },

  {
    accessorKey: "variants",
    header: "Price",
    cell: ({ row }) => {
      const prices = row.original.variants.map((v) => v.priceInCents) ?? [0];

      const minPrice = Math.min(...prices);

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(minPrice / 100);

      return (
        <div>
          {formatted} {[...new Set(prices)]?.length > 1 && "+"}
        </div>
      );
    },
  },

  {
    accessorKey: "updatedAt",
    header: "Last updated on",
    cell: ({ row }) => format(row.original.updatedAt, "MMMM do, yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CellActions
        handleOnDelete={row.original.onDelete}
        id={row.original.id}
        copyText="Product ID"
        isLoading={row.original.isLoading}
        handleOnDuplicate={row.original.onDuplicate}
      />
    ),
  },
];
