import type { Fulfillment, FulfillmentStatus } from "@prisma/client";
import {
  CheckIcon,
  Download,
  Loader2,
  MoreVertical,
  Package,
  Truck,
  TruckIcon,
} from "lucide-react";
import Link from "next/link";

import { ViewSection } from "~/components/common/sections/view-section.admin";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

import type { Order, OrderAddress, OrderItem } from "~/types/order";
import { api } from "~/utils/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toastService } from "~/lib/toast";
import { FulfillmentDialog } from "./fulfillment-dialog";

type Props = {
  fulfillments: Fulfillment[];
  fulfillmentStatus: FulfillmentStatus;

  shippingAddress: OrderAddress | null;
  orderItems: OrderItem[];
  order: Order;

  createdAt: Date;
  id: string;

  request: {
    estimatedCompletionAt?: Date | null;
  } | null;

  isPickup: boolean;
  pickupInstructions?: string;

  email: string;
};
export const ViewOrderFulfillment = ({
  fulfillments,
  id,
  orderItems,
  shippingAddress,
  createdAt,
  fulfillmentStatus,
  order,
  isPickup,
  request,
  pickupInstructions,
  email,
}: Props) => {
  const apiContext = api.useContext();

  const updateFulfillment = api.order.updateFulfillmentStatus.useMutation({
    onSuccess: () => {
      toastService.success("Fulfillment status updated");
    },
    onError: (e) => {
      toastService.error(e.message ?? "Failed to update fulfillment status", e);
    },
    onSettled: () => {
      void apiContext.order.invalidate();
    },
  });
  const updateOrderShippingStatus = api.order.updateShippingStatus.useMutation({
    onSuccess: () => {
      toastService.success("Fulfillment status updated");
    },
    onError: (e) => {
      toastService.error(e.message ?? "Failed to update fulfillment status", e);
    },
    onSettled: () => {
      void apiContext.order.invalidate();
    },
  });

  const extraCompletionDays =
    orderItems
      ?.map(
        (item) =>
          item?.variant?.product?.estimatedCompletion ??
          Math.ceil(
            Math.abs(
              new Date().getTime() -
                (request?.estimatedCompletionAt?.getTime() ??
                  new Date().getTime())
            ) /
              (1000 * 3600 * 24)
          )
      )
      .reduce((a, b) => a + b, 0) ?? 0;

  const shipOutDate = new Date(
    createdAt.setDate(createdAt.getDate() + 7 + extraCompletionDays)
  ).toDateString();

  const getUnfulfilledOrderItems = api.order.getUnfulfilledItems.useQuery(
    {
      orderId: id,
    },
    {
      enabled: !!id,
    }
  );

  const sendPickupNotification = api.order.sendPickupNotification.useMutation({
    onSuccess: () => {
      toastService.success("Pickup notification sent");
    },
    onError: (e) => {
      toastService.error(e.message ?? "Failed to send pickup notification", e);
    },
    onSettled: () => {
      void apiContext.order.invalidate();
    },
  });

  const handleDownloadShippingLabel = ({
    url,
    fulfillmentId,
  }: {
    url: string;
    fulfillmentId: string;
  }) => {
    updateFulfillment.mutate({
      fulfillmentId,
      status: "LABEL_PRINTED",
    });

    if (getUnfulfilledOrderItems?.data?.length === 0)
      updateOrderShippingStatus.mutate({
        orderId: id,
        fulfillmentStatus: "FULFILLED",
      });
    else
      updateOrderShippingStatus.mutate({
        orderId: id,
        fulfillmentStatus: "PARTIAL",
      });

    window.open(`${url}`, "_blank");
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            Fulfillment ({fulfillmentStatus})
          </CardTitle>
          <CardDescription>Handle fulfillments for your order</CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {order && !isPickup && (
            <FulfillmentDialog initialData={order}>
              <Button variant="outline" size="sm">
                <TruckIcon className="mr-2 h-4 w-4" />
                Get shipping label
              </Button>
            </FulfillmentDialog>
          )}
          {isPickup && fulfillmentStatus !== "FULFILLED" && (
            <Button
              disabled={sendPickupNotification.isLoading}
              size="sm"
              variant={
                fulfillmentStatus === "AWAITING_PICKUP" ? "outline" : "default"
              }
              onClick={() => sendPickupNotification.mutate({ orderId: id })}
            >
              {sendPickupNotification.isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Package className="mr-2 size-4" />
              )}
              Email customer to pickup
            </Button>
          )}

          {isPickup && fulfillmentStatus === "AWAITING_PICKUP" && (
            <Button
              disabled={sendPickupNotification.isLoading}
              size="sm"
              onClick={() =>
                updateOrderShippingStatus.mutate({
                  orderId: id,
                  fulfillmentStatus: "FULFILLED",
                })
              }
            >
              {updateOrderShippingStatus.isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckIcon className="mr-2 size-4" />
              )}
              Mark as fulfilled
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="gap-1 text-sm"
                onClick={() =>
                  updateOrderShippingStatus.mutate({
                    orderId: id,
                    fulfillmentStatus: "FULFILLED",
                  })
                }
              >
                <CheckIcon className="h-4 w-4" /> Mark as fulfilled
              </DropdownMenuItem>

              <FulfillmentDialog initialData={order}>
                <DropdownMenuItem
                  className="gap-1 text-sm"
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <Truck className="h-4 w-4" /> Create Shipping Label
                </DropdownMenuItem>
              </FulfillmentDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-4 text-sm">
        <p className="text-base">
          Customer opted into{" "}
          <strong>{isPickup ? "Pickup" : "Shipping"}</strong>
        </p>

        {!isPickup && (
          <div className="w-full  pt-4 text-left">
            <p className="text-muted-foreground">Ship to:</p>{" "}
            {shippingAddress?.street === " " ? (
              <>
                <p className="text-red-500">Collect address from customer!</p>
              </>
            ) : (
              <>
                {" "}
                <p>{shippingAddress?.name}</p>
                <p>{shippingAddress?.street}</p>
                <p>{shippingAddress?.additional}</p>
                <p>
                  {shippingAddress?.city}, {shippingAddress?.state}{" "}
                  {shippingAddress?.postal_code}
                </p>
              </>
            )}
          </div>
        )}

        {isPickup && (
          <div className="w-full  pt-4 text-left">
            <p className="text-muted-foreground">Details:</p>{" "}
            {shippingAddress?.street === " " && !isPickup ? (
              <>
                <p className="text-red-500">Collect address from customer!</p>
              </>
            ) : (
              <>
                <p>{shippingAddress?.name}</p>
              </>
            )}
          </div>
        )}

        <Separator className="my-4" />

        <div className="w-full  text-left">
          <p className="text-muted-foreground">Items in this order:</p>{" "}
          {orderItems?.map((item) => (
            <div key={item.id} className="flex gap-2">
              <div className="w-16 ">
                <p className="truncate text-sm text-muted-foreground">
                  {item?.variant?.sku ??
                    item?.variant?.id ??
                    item?.requestItem?.id ??
                    "N/A"}
                </p>
              </div>
              <p>
                {item?.variant?.product?.name ??
                  item?.requestItem?.name ??
                  "Unlisted / Deleted Product"}{" "}
                (
                {item?.variant?.values && item?.variant?.values?.length > 0
                  ? item?.variant?.values.join(", ")
                  : "Default"}
                ) X {item?.quantity}
              </p>
              <p></p>
            </div>
          ))}
        </div>

        {getUnfulfilledOrderItems?.data &&
          getUnfulfilledOrderItems?.data?.length > 0 &&
          getUnfulfilledOrderItems?.data?.length !== orderItems?.length && (
            <div className="w-full  text-left">
              <p className="text-muted-foreground">
                Items left to be fulfilled:
              </p>{" "}
              {getUnfulfilledOrderItems?.data?.map((item) => (
                <div key={item.id} className="flex gap-2">
                  <div className="w-16 ">
                    <p className="truncate text-sm text-muted-foreground">
                      {item?.variant?.sku ?? item?.variant?.id}
                    </p>
                  </div>
                  <p>
                    {item?.variant?.product?.name} (
                    {item?.variant?.values && item?.variant?.values?.length > 0
                      ? item?.variant?.values.join(", ")
                      : "Default"}
                    ) X {item?.quantity}
                  </p>
                  <p></p>
                </div>
              ))}
            </div>
          )}

        {fulfillments?.length > 0 && <Separator className="my-4" />}
        {fulfillments?.map((fulfillment, idx) => (
          <ViewSection
            key={fulfillment.id}
            title={`Shipment ${idx + 1} Details`}
            description="View the details of the shipment."
            titleClassName="text-sm font-medium "
            bodyClassName="flex items-center justify-between gap-4"
          >
            <div className="flex flex-col">
              <p>Purchased on: {fulfillment.createdAt.toDateString()}</p>
              <p>
                {fulfillment.shippedAt && fulfillment.shippedAt > new Date()
                  ? "Scheduled to ship on: "
                  : " Shipped on: "}{" "}
                {fulfillment.shippedAt?.toDateString() ?? "UNKNOWN"}
              </p>
              <p>Carrier: {fulfillment.carrier}</p>
              <p>
                Tracking Number:{" "}
                <Link
                  href={fulfillment.trackingUrl!}
                  target="_blank"
                  className="font-semibold underline"
                >
                  {fulfillment.trackingNumber}
                </Link>
              </p>
              <p>Status: {fulfillment.status}</p>
            </div>

            <Button
              onClick={() =>
                handleDownloadShippingLabel({
                  url: `${fulfillment.labelUrl}`,
                  fulfillmentId: fulfillment.id,
                })
              }
              className="flex items-center gap-2"
            >
              <Download size={20} />
              {/* Download Shipping Label */}
            </Button>
          </ViewSection>
        ))}
      </CardContent>
      {/* <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
  
      </CardFooter> */}
    </Card>
  );
};
