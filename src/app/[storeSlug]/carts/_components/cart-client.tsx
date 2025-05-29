"use client";

import { useMemo } from "react";

import type { CartWithCustomerAndItems } from "~/types/cart";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { cartColumnData } from "./cart-column-data";

type Props = {
  storeSlug: string;
  carts: CartWithCustomerAndItems[];
};

export const CartClient = ({ storeSlug, carts }: Props) => {
  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["customer"],
  });

  const deleteCart = api.cart.delete.useMutation(defaultActions);

  const columnData = useMemo(() => {
    return (
      carts?.map((cart) => ({
        ...cart,
        storeSlug,
        customerId: cart.customer?.id ?? undefined,
        email: cart.customer?.email ?? undefined,
        cartItemCount: cart.cartItems?.length ?? 0,
        onDelete: (id: string) => deleteCart.mutate(id),
        isLoading: deleteCart.isPending,
      })) ?? []
    );
  }, [carts, deleteCart, storeSlug]);

  return (
    <AdvancedDataTable
      searchKey="email"
      columns={cartColumnData}
      data={columnData}
    />
  );
};
