import type { ColumnDef } from "@tanstack/react-table";

import { CellActions } from "~/components/shared/cell-actions";
import { PrimaryCellLink } from "~/components/shared/primary-cell-link";

export type CartColumnData = {
  id: string;
  customerId?: string;
  email?: string;
  storeSlug: string;
  cartItemCount: number;
  isLoading: boolean;
  onDelete: (id: string) => void;
};

export const cartColumnData: ColumnDef<CartColumnData>[] = [
  {
    accessorKey: "email",
    header: "Email",
    filterFn: "includesString",

    cell: ({ row }) => (
      <PrimaryCellLink
        id={row.original.id}
        name={row.original.email ?? "Guest"}
        subheader={row.original.id ?? ""}
        link={`/${row.original.storeSlug}/carts/${row.original.id}/edit`}
      />
    ),
  },

  {
    accessorKey: "cartItemCount",
    header: "Cart Items",
  },

  {
    id: "actions",
    cell: ({ row }) => (
      <CellActions
        id={row.original.id}
        isLoading={row.original.isLoading}
        hasUpdate={false}
        handleOnDelete={row.original.onDelete}
      />
    ),
  },
];
