import {
  type Address,
  type Customer,
  type Order,
  type ProductQuote,
  type ProductRequest,
} from "@prisma/client";

// export type ProductRequest = {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   status: ProductRequestStatus;
//   customerId: string | null;
//   phone: string | null;
//   details: string;
//   images: string[];
//   orderId: string | null;
//   quotes?: ProductQuote[];
//   customer?: Customer;
//   createdAt: Date;
//   updatedAt: Date;
// };

// export type ProductQuote = {
//   id: string;
//   productRequestId: string;
//   amountInCents: number;
//   status: "PENDING" | "ACCEPTED" | "REJECTED";
//   message: string | null;
//   createdAt: Date;
//   updatedAt: Date;
//   expiresAt: Date | null;
// };

export type ProductRequestWithQuotes = ProductRequest & {
  quotes: ProductQuote[];
};

export type ProductRequestWithCustomer = ProductRequest & {
  quotes: ProductQuote[];
  customer: Customer & {
    orders: Order[];
    addresses: Address[];
    _count: {
      orders?: number;
    };
  };
};
