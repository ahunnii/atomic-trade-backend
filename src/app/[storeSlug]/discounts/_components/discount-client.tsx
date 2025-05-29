"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import type { Discount } from "@prisma/client";

import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { CreateDiscountDialog } from "./create-discount-dialog";
import { discountColumnData } from "./discount-column-data";

type Props = { storeSlug: string; discounts: Discount[] };

export const DiscountClient = ({ storeSlug, discounts }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["discount"],
  });

  const deleteDiscount = api.discount.delete.useMutation(defaultActions);
  const duplicateDiscount = api.discount.duplicate.useMutation({
    ...defaultActions,
    onSuccess: ({ data, message }) => {
      defaultActions.onSuccess({ message });
      void router.push(`/${storeSlug}/discounts/${data.id}/edit`);
    },
  });

  const columnData = useMemo(() => {
    return (
      discounts?.map((discount) => ({
        ...discount,
        storeSlug,
        uses: discount?.uses ?? 0,
        onDelete: (id: string) => deleteDiscount.mutate(id),
        isLoading: deleteDiscount.isPending || duplicateDiscount.isPending,
        onDuplicate: (id: string) => duplicateDiscount.mutate(id),
      })) ?? []
    );
  }, [discounts, deleteDiscount, duplicateDiscount, storeSlug]);

  return (
    <AdvancedDataTable
      searchKey="code"
      columns={discountColumnData}
      data={columnData}
      addButton={<CreateDiscountDialog storeSlug={storeSlug} />}
    />
  );
};
