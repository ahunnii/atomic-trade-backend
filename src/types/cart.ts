import type { Cart, CartItem, Customer } from "@prisma/client";

export type CartWithCustomerAndItems = Cart & {
  customer: Customer;
  cartItems: CartItem[];
};
