"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";

import { ContentLayout } from "../../_components/content-layout";
import { customerColumnData } from "./customer-column-data";

type Props = { storeId: string; storeSlug: string };

export const CustomerClient = ({ storeId, storeSlug }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["customer"],
  });

  const storeCustomers = api.customer.getAll.useQuery(storeId);
  const deleteCustomer = api.customer.delete.useMutation(defaultActions);

  const columnData = useMemo(() => {
    return (
      storeCustomers?.data?.map((customer) => ({
        ...customer,
        storeSlug,
        name: customer.firstName + " " + customer.lastName,
        orderCount: customer.orders.length,
        totalSpentInCents: customer.orders.reduce(
          (acc, order) => acc + order.total,
          0,
        ),
        generalLocation:
          customer.addresses[0]?.city + ", " + customer.addresses[0]?.state,

        onDelete: (id: string) => deleteCustomer.mutate(id),
        isLoading: deleteCustomer.isPending,
      })) ?? []
    );
  }, [storeCustomers?.data, deleteCustomer, storeSlug]);

  return (
    <ContentLayout title={`Customers (${storeCustomers?.data?.length ?? 0})`}>
      <div className="py-4">
        <AdvancedDataTable
          searchKey="name"
          columns={customerColumnData}
          data={columnData}
          addButtonLabel="Add Customer"
          handleAdd={() => router.push(`/${storeSlug}/customers/new`)}
        />
      </div>
    </ContentLayout>
  );
};
