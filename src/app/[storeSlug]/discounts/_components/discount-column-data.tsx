import { format } from "date-fns";

import { type ColumnDef } from "@tanstack/react-table";

import { env } from "~/env";
import { Badge } from "~/components/ui/badge";
import { CellActions } from "~/components/shared/cell-actions";
import { PrimaryCellLink } from "~/components/shared/primary-cell-link";

export type DiscountColumn = {
  id: string;
  storeId: string;
  storeSlug: string;
  code: string;
  type: string;
  isAutomatic: boolean;
  description?: string | null;
  isActive: boolean;
  combineWithProductDiscounts: boolean;
  combineWithOrderDiscounts: boolean;
  combineWithShippingDiscounts: boolean;
  uses?: number | null;
  updatedAt: Date;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  isLoading: boolean;
};

export const discountColumnData: ColumnDef<DiscountColumn>[] = [
  {
    accessorKey: "code",
    header: "Title",
    cell: ({ row }) => (
      <PrimaryCellLink
        id={row.original.id}
        name={row.original.code}
        subheader={row.original.description ?? undefined}
        link={`/${row.original.storeSlug}/discounts/${row.original.id}/edit`}
      />
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => <>{row.original.isActive ? "Active" : "Inactive"}</>,
  },

  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <>
        {row.original.type === "PRODUCT"
          ? "Amount off Products"
          : row.original.type === "ORDER"
            ? "Amount off Order"
            : "Shipping Discount"}
      </>
    ),
  },
  {
    accessorKey: "isAutomatic",
    header: "Method",
    cell: ({ row }) => (
      <>{row.original.isAutomatic ? "Automatic via Sale" : "Via Code"}</>
    ),
  },
  {
    id: "combinations",
    header: "Combinations",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.combineWithOrderDiscounts && (
          <Badge variant="outline">Order Discounts</Badge>
        )}

        {row.original.combineWithProductDiscounts && (
          <Badge variant="outline">Product Discounts</Badge>
        )}

        {row.original.combineWithShippingDiscounts && (
          <Badge variant="outline">Shipping Discounts</Badge>
        )}
      </div>
    ),
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
        id={row.original.code}
        copyText="Discount Code"
        isLoading={row.original.isLoading}
      />
    ),
  },
];
