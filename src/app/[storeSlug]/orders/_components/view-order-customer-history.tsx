import { ViewSection } from "~/components/common/sections/view-section.admin";

import { api } from "~/utils/api";

import { orderHistoryColumns } from "./order-history-columns";

import { AdvancedDataTable } from "~/components/common/tables/advanced-data-table";
import type { OrderColumn } from "~/types/order";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { MoreVertical } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type Props = { customerId: string | null | undefined };

export const ViewOrderCustomerHistory = ({ customerId }: Props) => {
  const getCustomerOrders = api.order.getCustomerOrderHistory.useQuery(
    { customerId: customerId! },
    { enabled: !!customerId }
  );
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            Order History
          </CardTitle>
          <CardDescription>Check out past orders</CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-1" />
      </CardHeader>
      <CardContent className="p-6 pt-4 text-sm">
        {getCustomerOrders?.data && (
          <AdvancedDataTable
            searchKey="id"
            columns={orderHistoryColumns}
            data={getCustomerOrders?.data as OrderColumn[]}
          />
        )}

        {((getCustomerOrders?.data && getCustomerOrders?.data.length === 0) ??
          !customerId) && (
          <div className="flex flex-col items-center justify-center space-y-2">
            <p className="text-center text-gray-500">No orders found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
