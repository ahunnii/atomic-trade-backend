// import typeCustomer,  { Order } from "@prisma/client";

import type { Address, Customer, Order } from "@prisma/client";

// import type { Address } from "./store";

// export type Customer = {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone?: string | null;
//   userId?: string | null;
//   tags: string[];
//   notes: string | null;
//   addresses: Address[];
//   createdAt: Date;
//   updatedAt: Date;
//   _count?: {
//     orders?: number | null;
//   } | null;
//   metadata?: Record<string, unknown>;
// };

export type CustomerWithOrders = Customer & {
  orders: Order[];
  addresses: Address[];
  _count?: {
    orders?: number;
  };
};
