"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { ContentLayout } from "../../_components/content-layout";
import { cartColumnData } from "./cart-column-data";

type Props = { storeId: string; storeSlug: string };

export const CartClient = ({ storeId, storeSlug }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["customer"],
  });

  const storeCarts = api.cart.getAll.useQuery(storeId);
  const deleteCart = api.cart.delete.useMutation(defaultActions);

  const columnData = useMemo(() => {
    return (
      storeCarts?.data?.map((cart) => ({
        ...cart,
        storeSlug,
        customerId: cart.customerId ?? undefined,
        email: cart.customer?.email ?? undefined,
        cartItemCount: cart.cartItems.length,
        onDelete: (id: string) => deleteCart.mutate(id),
        isLoading: deleteCart.isPending,
      })) ?? []
    );
  }, [storeCarts?.data, deleteCart, storeSlug]);

  return (
    <ContentLayout title={`Carts (${storeCarts?.data?.length ?? 0})`}>
      <div className="py-4">
        <AdvancedDataTable
          searchKey="email"
          columns={cartColumnData}
          data={columnData}
          addButtonLabel="Add Cart"
          handleAdd={() => router.push(`/${storeSlug}/carts/new`)}
        />
      </div>
    </ContentLayout>
  );
};
