import { format } from "date-fns";

import type { BlogStatus } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";

import { CellActions } from "~/components/shared/cell-actions";
import { PrimaryCellLink } from "~/components/shared/primary-cell-link";

export type CollectionColumn = {
  id: string;
  storeId: string;
  storeSlug: string;
  title: string;
  status: BlogStatus;
  updatedAt: Date;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  isLoading: boolean;
};

export const sitePageColumnData: ColumnDef<CollectionColumn>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <PrimaryCellLink
        id={row.original.id}
        name={row.original.title}
        link={`/${row.original.storeSlug}/pages/site/${row.original.id}/edit`}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <>{row.original.status}</>,
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
        copyText="Site Page ID"
        isLoading={row.original.isLoading}
      />
    ),
  },
];
