import type { Address, Store } from "@prisma/client";

export type StoreWithShipping = Store & {
  address: Address;
};
