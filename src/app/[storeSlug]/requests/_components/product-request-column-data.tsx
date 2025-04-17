import type { ProductRequestStatus } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "~/components/ui/badge";
import { CellActions } from "~/components/shared/cell-actions";
import { PrimaryCellLink } from "~/components/shared/primary-cell-link";

export type ProductRequestColumn = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  details: string;
  storeSlug: string;
  status: ProductRequestStatus;
  quotesSent: number;
  isLoading: boolean;
  onDelete: (id: string) => void;
};

export const productRequestColumnData: ColumnDef<ProductRequestColumn>[] = [
  {
    id: "name",
    header: "Name",
    filterFn: "includesString",

    cell: ({ row }) => (
      <PrimaryCellLink
        id={row.original.id}
        name={row.original.firstName + " " + row.original.lastName}
        subheader={row.original.email}
        link={`/${row.original.storeSlug}/requests/${row.original.id}/edit`}
      />
    ),
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => <span>{row.original.details}</span>,
  },
  {
    accessorKey: "quotesSent",
    header: "Quotes Sent",
    cell: ({ row }) => <span>{row.original.quotesSent}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge>{row.original.status}</Badge>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CellActions
        id={row.original.id}
        copyText="Request ID"
        isLoading={row.original.isLoading}
        hasUpdate={false}
        handleOnDelete={row.original.onDelete}
      />
    ),
  },
];
