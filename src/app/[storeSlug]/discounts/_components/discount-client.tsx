"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { ContentLayout } from "../../_components/content-layout";
import { CreateDiscountDialog } from "./create-discount-dialog";
import { discountColumnData } from "./discount-column-data";

type Props = { storeId: string; storeSlug: string };

export const DiscountClient = ({ storeId, storeSlug }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["discount"],
  });

  const storeDiscounts = api.discount.getAll.useQuery(storeId);
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
      storeDiscounts?.data?.map((discount) => ({
        ...discount,
        storeSlug,
        uses: discount?.uses ?? 0,
        onDelete: (id: string) => deleteDiscount.mutate(id),
        isLoading: deleteDiscount.isPending || duplicateDiscount.isPending,
        onDuplicate: (id: string) => duplicateDiscount.mutate(id),
      })) ?? []
    );
  }, [storeDiscounts?.data, deleteDiscount, duplicateDiscount, storeSlug]);

  return (
    <ContentLayout title={`Discounts (${storeDiscounts?.data?.length ?? 0})`}>
      <div className="py-4">
        <AdvancedDataTable
          searchKey="code"
          columns={discountColumnData}
          data={columnData}
          addButton={<CreateDiscountDialog storeSlug={storeSlug} />}
        />
      </div>
    </ContentLayout>
  );
};
