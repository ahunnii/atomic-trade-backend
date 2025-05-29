import type { ColumnDef } from "@tanstack/react-table";

import { CellActions } from "~/components/shared/cell-actions";
import { PrimaryCellLink } from "~/components/shared/primary-cell-link";

export type CustomerColumnData = {
  id: string;
  name: string;
  storeSlug: string;
  email: string;
  orderCount: number;
  totalSpentInCents: number;
  generalLocation: string;
  isLoading: boolean;
  onDelete: (id: string) => void;
};

export const customerColumnData: ColumnDef<CustomerColumnData>[] = [
  {
    accessorKey: "name",
    header: "Name",
    filterFn: "includesString",

    cell: ({ row }) => (
      <PrimaryCellLink
        id={row.original.id}
        name={row.original.name}
        subheader={row.original.email}
        link={`/${row.original.storeSlug}/customers/${row.original.id}/edit`}
      />
    ),
  },
  {
    accessorKey: "generalLocation",
    header: "Location",
  },
  {
    accessorKey: "orderCount",
    header: "Orders",
  },
  {
    accessorKey: "totalSpentInCents",
    header: "Total Spent",
    cell: ({ row }) => (
      <span>
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(row.original.totalSpentInCents / 100)}
      </span>
    ),
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
