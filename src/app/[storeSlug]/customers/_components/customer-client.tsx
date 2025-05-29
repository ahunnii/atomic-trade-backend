"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import type { CustomerWithOrders } from "~/types/customer";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { customerColumnData } from "./customer-column-data";

type Props = {
  storeSlug: string;
  customers: CustomerWithOrders[];
};

export const CustomerClient = ({ storeSlug, customers }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["customer"],
  });

  const deleteCustomer = api.customer.delete.useMutation(defaultActions);

  const columnData = useMemo(() => {
    return (
      customers?.map((customer) => ({
        ...customer,
        storeSlug,
        name: customer.firstName + " " + customer.lastName,
        orderCount: customer._count?.orders ?? 0,
        totalSpentInCents: customer.orders.reduce(
          (acc, order) => acc + order.totalInCents,
          0,
        ),
        generalLocation:
          customer.addresses[0]?.city + ", " + customer.addresses[0]?.state,

        onDelete: (id: string) => deleteCustomer.mutate(id),
        isLoading: deleteCustomer.isPending,
      })) ?? []
    );
  }, [customers, deleteCustomer, storeSlug]);

  return (
    <AdvancedDataTable
      searchKey="name"
      columns={customerColumnData}
      data={columnData}
      addButtonLabel="Add Customer"
      handleAdd={() => router.push(`/${storeSlug}/customers/new`)}
    />
  );
};
