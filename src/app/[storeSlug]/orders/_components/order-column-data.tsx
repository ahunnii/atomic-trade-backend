import { format } from "date-fns";

import { type ColumnDef } from "@tanstack/react-table";

import type {
  FulfillmentStatus,
  FulfillmentType,
  PaymentStatus,
} from "~/types/order";
import { CellActions } from "~/components/shared/cell-actions";
import { PrimaryCellLink } from "~/components/shared/primary-cell-link";

export type OrderColumn = {
  id: string;
  storeId: string;
  storeSlug: string;
  email: string;
  orderNumber: string;
  numberOfItems: number;
  paymentStatus: string;
  fulfillmentStatus: FulfillmentStatus;
  customer: {
    id: string;
    name: string;
  };
  deliveryMethod: FulfillmentType;
  total: number;
  createdAt: Date;
  onDelete: (id: string) => void;
  isLoading: boolean;
};

export const orderColumnData: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "orderNumber",
    accessorFn: (row) => row.orderNumber ?? "",
    header: "Order Number",
    filterFn: (row, id, value) => {
      const name: string = row.getValue(id);
      return name.includes(value as string);
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <PrimaryCellLink
            id={row.original.id}
            name={`#${row.original.orderNumber}`}
            link={`/${row.original.storeSlug}/orders/${row.original.id}`}
          />
        </div>
      );
    },
  },

  {
    accessorKey: "customer.name",
    accessorFn: (row) => row.customer.name ?? "",
    header: "Customer",
    filterFn: (row, id, value) => {
      const name: string = row.getValue(id);
      return name.includes(value as string);
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <PrimaryCellLink
            id={row.original.id}
            name={row.original.customer.name ?? "Guest"}
            link={`/${row.original.storeSlug}/customers/${row.original.customer.id}`}
          />
        </div>
      );
    },
  },

  {
    accessorKey: "createdAt",
    header: "Date ",
    cell: ({ row }) => {
      return (
        <p className="">{format(row.original.createdAt, "MMMM do, yyyy")}</p>
      );
    },
  },

  // {
  //   accessorKey: "paymentStatus",
  //   header: "Payment Status",
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id) as string) || value.includes(row.original.paymentStatus);
  //   },
  //   cell: ({ row }) => {
  //     return <p className="">{`${row.original.paymentStatus}`}</p>;
  //   },
  // },
  // {
  //   accessorKey: "fulfillmentStatus",
  //   header: "Fulfillment Status",
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id) as string);
  //   },
  //   cell: ({ row }) => {
  //     return <p className="">{`${row.original.fulfillmentStatus}`}</p>;
  //   },
  // },

  {
    accessorKey: "total",
    header: "Total price",
    cell: ({ row }) => {
      return (
        <span>
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(row.original.total / 100)}
        </span>
      );
    },
  },

  {
    accessorKey: "numberOfItems",
    header: "Items",
    cell: ({ row }) => {
      return <span>{row.original.numberOfItems}</span>;
    },
  },

  {
    id: "actions",
    cell: ({ row }) => (
      <CellActions
        handleOnDelete={row.original.onDelete}
        id={row.original.id}
        copyText="Order ID"
        isLoading={row.original.isLoading}
        hasUpdate={false}
      />
    ),
  },
];
