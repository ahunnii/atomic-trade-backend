import { type ProductRequestStatus } from "@prisma/client";

import type { Customer } from "~/types/customer";

export type ProductRequest = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: ProductRequestStatus;
  customerId: string | null;
  phone: string | null;
  details: string;
  images: string[];
  orderId: string | null;
  quotes?: ProductQuote[];
  customer?: Customer;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductQuote = {
  id: string;
  productRequestId: string;
  amountInCents: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  message: string | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
};
