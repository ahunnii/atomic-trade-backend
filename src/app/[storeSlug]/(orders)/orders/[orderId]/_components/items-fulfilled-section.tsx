import Link from "next/link";
import { Check, Clock, MoreHorizontal, Package } from "lucide-react";

import type { FulfillmentWithPackages } from "~/types/order";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { MarkAsFulfilledDialog } from "../../_components/mark-as-fulfilled-dialog";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  isPhysical: boolean;
  isFulfilled: boolean;
}

interface FulfilledItemInfo {
  name: string;
  quantity: number;
}

interface Props {
  fulfillment?: FulfillmentWithPackages;
  orderItems: OrderItem[];
  orderNumber: string;
  storeSlug: string;
  orderId: string;
}

export const ItemsFulfilledSection = ({
  orderId,
  fulfillment,
  orderItems,

  storeSlug,
}: Props) => {
  // Calculate fulfilled quantities for each order item
  const getFulfilledQuantities = () => {
    const fulfilledQuantities = new Map<string, number>();

    fulfillment?.packages?.forEach((pkg) => {
      pkg.items.forEach((item) => {
        const currentQuantity = fulfilledQuantities.get(item.orderItemId) ?? 0;
        fulfilledQuantities.set(
          item.orderItemId,
          currentQuantity + item.quantity,
        );
      });
    });

    return fulfilledQuantities;
  };

  const fulfilledQuantities = getFulfilledQuantities();

  // Check if all items are fulfilled
  const isAllItemsFulfilled = () => {
    return orderItems.every((item) => {
      // Check both the isFulfilled flag and the fulfilled quantities
      if (item.isFulfilled) return true;

      const fulfilledQuantity = fulfilledQuantities.get(item.id) ?? 0;
      return fulfilledQuantity >= item.quantity;
    });
  };

  const allItemsFulfilled = isAllItemsFulfilled();

  // Get unfulfilled items
  const getUnfulfilledItems = () => {
    return orderItems
      .filter((item) => {
        // Skip items that are already marked as fulfilled
        if (item.isFulfilled) return false;

        const fulfilledQuantity = fulfilledQuantities.get(item.id) ?? 0;
        return fulfilledQuantity < item.quantity;
      })
      .map((item) => ({
        ...item,
        remainingQuantity:
          item.quantity - (fulfilledQuantities.get(item.id) ?? 0),
      }));
  };

  const unfulfilledItems = getUnfulfilledItems();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "IN_TRANSIT":
      case "PRE_TRANSIT":
      case "OUT_FOR_DELIVERY":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
      case "LABEL_PRINTED":
      case "LABEL_PURCHASED":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Get list of unique items that have been fulfilled
  const fulfilledItems = new Map<string, FulfilledItemInfo>();
  fulfillment?.packages?.forEach((pkg) => {
    pkg.items.forEach((item) => {
      const orderItem = orderItems.find((oi) => oi.id === item.orderItemId);
      if (orderItem) {
        const currentQuantity =
          fulfilledItems.get(item.orderItemId)?.quantity ?? 0;
        fulfilledItems.set(item.orderItemId, {
          name: orderItem.name,
          quantity: currentQuantity + item.quantity,
        });
      }
    });
  });

  // Add manually fulfilled items (items with isFulfilled=true) to the fulfilledItems map
  orderItems.forEach((item) => {
    if (item.isFulfilled && !fulfilledItems.has(item.id)) {
      fulfilledItems.set(item.id, {
        name: item.name,
        quantity: item.quantity,
      });
    }
  });

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["order", "fulfillment"],
  });

  const markAsFulfilled =
    api.fulfillment.markAsFulfilled.useMutation(defaultActions);

  return (
    <Card className="space-y-4 px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {allItemsFulfilled ? (
            <Check className="h-5 w-5 text-green-600" />
          ) : (
            <Clock className="h-5 w-5 text-amber-600" />
          )}
          <h2 className="text-xl font-semibold">
            {allItemsFulfilled ? "All Items Fulfilled" : "Order Fulfillment"}
          </h2>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem>Mark as Fulfilled</DropdownMenuItem>
              <Link href={`/${storeSlug}/orders/${orderId}/fulfill`}>
                <DropdownMenuItem>Manage Fulfillment</DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Unfulfilled items section */}
      {unfulfilledItems.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 text-sm font-medium text-amber-800">
            {unfulfilledItems.length}{" "}
            {unfulfilledItems.length === 1 ? "item" : "items"} waiting to be
            fulfilled
          </p>

          <div className="space-y-1">
            {unfulfilledItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span className="text-amber-700">
                  x{item.remainingQuantity}
                </span>
              </div>
            ))}
          </div>
          {/* 
          <div className="mt-3">
            <Link href={`/${storeSlug}/orders/${orderId}/fulfill`}>
              <Button size="sm" variant="outline">
                Fulfill Items
              </Button>
            </Link>
          </div> */}
        </div>
      )}

      {/* Fulfilled items section */}
      {(!!fulfillment?.packages?.length ||
        orderItems.some((item) => item.isFulfilled)) && (
        <>
          <div className="rounded-lg border p-4">
            <p className="mb-2 text-sm text-gray-600">
              {fulfilledItems.size > 0 ? (
                <>
                  {Array.from(fulfilledItems.values()).reduce(
                    (total, item) => total + item.quantity,
                    0,
                  )}{" "}
                  {Array.from(fulfilledItems.values()).reduce(
                    (total, item) => total + item.quantity,
                    0,
                  ) === 1
                    ? "item"
                    : "items"}{" "}
                  fulfilled
                  {fulfillment?.packages?.length
                    ? ` in ${fulfillment.packages.length} ${fulfillment.packages.length === 1 ? "package" : "packages"}`
                    : ""}
                </>
              ) : (
                "Items fulfilled"
              )}
            </p>

            <div className="space-y-1">
              {Array.from(fulfilledItems.entries()).map(([id, item]) => (
                <div key={id} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="text-gray-600">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Package tracking info */}
          {fulfillment?.packages && fulfillment.packages.length > 0 && (
            <div className="mt-4 space-y-3">
              <h3 className="text-sm font-medium">Packages</h3>
              {fulfillment.packages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span>Package {index + 1}</span>
                      <Badge className={getStatusColor(pkg.status)}>
                        {formatStatus(pkg.status)}
                      </Badge>
                    </div>
                    {pkg.carrier && (
                      <div className="mt-1 text-xs text-gray-500">
                        {pkg.carrier}{" "}
                        {pkg.trackingNumber && `• ${pkg.trackingNumber}`}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">
                      {pkg.items.length}{" "}
                      {pkg.items.length === 1 ? "item" : "items"}
                    </span>
                    {pkg.trackingUrl && (
                      <Link
                        href={pkg.trackingUrl}
                        target="_blank"
                        rel="noopener"
                      >
                        <Button variant="ghost" size="sm">
                          Track
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!fulfillment?.packages?.length &&
      !orderItems.some((item) => item.isFulfilled) &&
      orderItems.length > 0 ? (
        <div className="flex w-full flex-col items-center justify-center pt-8">
          <Package className="mb-2 h-12 w-12 text-gray-400" />
          <p className="text-center text-gray-600">
            No items have been fulfilled yet
          </p>

          <div className="mt-8 grid w-full grid-cols-2 gap-4">
            <MarkAsFulfilledDialog
              onAccept={() => {
                markAsFulfilled.mutate(orderId);
              }}
            >
              <Button className="w-full" type="button" variant="outline">
                Mark as Fulfilled
              </Button>
            </MarkAsFulfilledDialog>{" "}
            <Link
              href={`/${storeSlug}/orders/${orderId}/fulfill`}
              className="w-full"
            >
              <Button className="w-full">Fulfill Items</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {" "}
          {!allItemsFulfilled && (
            <div className="flex w-full flex-col items-center justify-center pt-8">
              <MarkAsFulfilledDialog
                onAccept={() => {
                  markAsFulfilled.mutate(orderId);
                }}
              >
                <Button className="w-full" type="button">
                  Mark as Fulfilled
                </Button>
              </MarkAsFulfilledDialog>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
