import type { Address } from "./store";

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  userId?: string | null;
  tags: string[];
  notes: string | null;
  addresses: Address[];
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    orders?: number | null;
  } | null;
};
