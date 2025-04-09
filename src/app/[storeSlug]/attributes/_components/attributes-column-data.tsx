"use client";

import { format } from "date-fns";

import { type ColumnDef } from "@tanstack/react-table";

import { CellActions } from "~/components/shared/cell-actions";
import { PrimaryCellLink } from "~/components/shared/primary-cell-link";

export type AttributeColumn = {
  id: string;
  storeSlug: string;
  name: string;
  products: {
    id: string;
  }[];
  values: string[];
  createdAt: Date;
  updatedAt: Date;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  isLoading: boolean;
};

export const attributeColumns: ColumnDef<AttributeColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <PrimaryCellLink
        id={row.original.id}
        name={row.original.name}
        link={`/${row.original.storeSlug}/attributes/${row.original.id}/edit`}
      />
    ),
  },
  {
    accessorKey: "products",
    header: "Products",
    cell: ({ row }) => <>{row.original.products?.length}</>,
  },
  {
    accessorKey: "updatedAt",
    header: "Last updated at",
    cell: ({ row }) => format(row.original.updatedAt, "MMMM do, yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CellActions
        handleOnDelete={row.original.onDelete}
        handleOnDuplicate={row.original.onDuplicate}
        id={row.original.id}
        copyText="Attribute ID"
        isLoading={row.original.isLoading}
      />
    ),
  },
];
