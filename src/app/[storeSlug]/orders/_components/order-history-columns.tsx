import type { ColumnDef } from "@tanstack/react-table";

import { format } from "date-fns";
import Link from "next/link";
import Currency from "~/components/common/currency";
import { Button } from "~/components/ui/button";

import type { OrderColumn } from "~/types/order";

export const orderHistoryColumns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "id",
    header: "Order Id",
    cell: ({ row }) => {
      return (
        <Link
          href={`/admin/${row.original.storeId}/orders/${row.original.id}`}
          target="_blank"
        >
          <Button variant={"link"} className="mx-0  truncate px-0 text-xs">
            {row.original.id}
          </Button>
        </Link>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date added",
    cell: ({ row }) => {
      return (
        <p className="">{format(row.original.createdAt, "MMMM do, yyyy")}</p>
      );
    },
  },

  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: ({ row }) => {
      return <p className="">{`${row.original.paymentStatus}`}</p>;
    },
  },
  {
    accessorKey: "fulfillmentStatus",
    header: "Fulfillment Status",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: ({ row }) => {
      return <p className="">{`${row.original.fulfillmentStatus}`}</p>;
    },
  },

  {
    accessorKey: "total",
    header: "Total price",
    cell: ({ row }) => {
      return <Currency className="font-base" value={row.original.total} />;
    },
  },
];
