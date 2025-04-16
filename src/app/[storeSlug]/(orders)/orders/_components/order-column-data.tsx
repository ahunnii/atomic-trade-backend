import { format } from "date-fns";

import type {
  OrderFulfillmentStatus,
  OrderPaymentStatus,
} from "@prisma/client";
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

  customer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  deliveryMethod: FulfillmentType;
  subtotalInCents: number;
  createdAt: Date;
  onDelete: (id: string) => void;
  isLoading: boolean;
  shippingAddress: {
    city?: string;
    state?: string;
  };
  fulfillmentStatus: OrderFulfillmentStatus;
  paymentStatus: OrderPaymentStatus;
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
    accessorFn: (row) => row.customer.firstName + " " + row.customer.lastName,
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
            name={
              row.original.customer.firstName +
              " " +
              row.original.customer.lastName
            }
            link={`/${row.original.storeSlug}/customers/${row.original.customer.id}`}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "shippingAddress",
    accessorFn: (row) =>
      row.shippingAddress
        ? `${row.shippingAddress.city}, ${row.shippingAddress.state}`
        : "No address",
    header: "Location",
    filterFn: (row, id, value) => {
      const location: string = row.getValue(id);
      return location.toLowerCase().includes((value as string).toLowerCase());
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          {row.original.shippingAddress ? (
            <span>
              {row.original.shippingAddress.city},{" "}
              {row.original.shippingAddress.state}
            </span>
          ) : (
            <span className="text-muted-foreground">No address</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "fulfillmentStatus",
    header: "Fulfillment",
    cell: ({ row }) => {
      return <p className="">{`${row.original.fulfillmentStatus}`}</p>;
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      return <p className="">{`${row.original.paymentStatus}`}</p>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date ",
    cell: ({ row }) => {
      return <span>{format(row.original.createdAt, "M/d/yy")}</span>;
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
    accessorKey: "subtotalInCents",
    header: "Subtotal",
    cell: ({ row }) => {
      return (
        <span>
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(row.original.subtotalInCents / 100)}
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
