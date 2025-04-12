import type { Fulfillment, PaymentMethod, PaymentStatus } from "@prisma/client";
import Link from "next/link";

import Currency from "~/components/common/currency";

import { Button, buttonVariants } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { env } from "~/env.mjs";
import { toastService } from "~/lib/toast";

import { CheckIcon, MoreVertical } from "lucide-react";

import { ReceiptRefundIcon } from "@heroicons/react/24/solid";
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
import { api } from "~/utils/api";
import { cn } from "~/utils/styles";

type Props = {
  id: string;
  referenceNumber: string;
  receiptLink?: string;
  fee: number;
  paymentStatus: PaymentStatus;
  total: number;
  fulfillments: Fulfillment[];
  paymentMethod: PaymentMethod;
  orderItems: {
    variantId?: string | null | undefined;
    quantity: number;
  }[];
};
export const ViewOrderPayment = ({
  id,
  referenceNumber,

  paymentStatus,
  total,
  fulfillments,
  fee,
  paymentMethod,
  orderItems,
}: Props) => {
  const apiContext = api.useContext();
  const handleRefund = async () => {
    const res = await fetch(env.NEXT_PUBLIC_API_URL + "/refund", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: id,
        referenceNumber,
      }),
    });

    if (res.status === 200) {
      toastService.success("Order refunded");
    } else {
      console.error(res);
      toastService.error("Failed to refund order", null);
    }
  };

  const totalCostOfLabels = fulfillments?.reduce(
    (acc, curr) => acc + (curr?.cost ?? 0),
    0
  );

  const markOrderAsPaid = api.order.markAsPaid.useMutation({
    onSuccess: () => toastService.success("Order marked as paid"),
    onError: (err) =>
      toastService.error(
        err?.message ?? "There was an issue marking the order as paid.",
        null
      ),
    onSettled: () => void apiContext.order.invalidate(),
  });

  const createPaymentLink = api.shoppingBag.createPaymentLink.useMutation({
    onSuccess: (data) => {
      console.log(data);
    },
  });
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            Payment Details
          </CardTitle>
          <CardDescription>
            Breakdown of the charge and estimated profit of the order
          </CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-1">
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
                onClick={() => markOrderAsPaid.mutate({ orderId: id })}
              >
                <CheckIcon className="h-4 w-4" /> Mark as paid
              </DropdownMenuItem>
              {paymentStatus === "PENDING" && (
                <DropdownMenuItem
                  className="gap-1 text-sm"
                  onClick={() =>
                    createPaymentLink.mutate({
                      items: orderItems.filter(
                        (
                          item
                        ): item is { variantId: string; quantity: number } =>
                          item.variantId !== undefined
                      ),
                    })
                  }
                >
                  Create Payment Link
                </DropdownMenuItem>
              )}{" "}
              <DropdownMenuItem
                className="gap-1 text-sm"
                onClick={() => void handleRefund()}
              >
                <ReceiptRefundIcon className="h-4 w-4" /> Refund Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-4 text-sm">
        <p>
          Status: <span className="font-semibold"> {paymentStatus}</span>{" "}
        </p>
        <p>
          Payment Method:{" "}
          <span className="font-semibold"> {paymentMethod}</span>{" "}
        </p>
        {/* <Separator className="my-2" /> */}
        <p className="my-4 text-lg font-semibold">Bank Account Breakdown:</p>
        {!env.NEXT_PUBLIC_STRIPE_PAYMENT_INTENT_URL && <p>{referenceNumber}</p>}
        <p className="flex w-full justify-between">
          Customer Paid: <Currency value={total ?? 0} />
        </p>
        {paymentMethod === "STRIPE" && (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              Processor Fee:{" "}
              <span className="flex gap-1 text-red-500">
                {" "}
                - <Currency value={fee ?? 0} />
              </span>
            </div>
          </div>
        )}
        {totalCostOfLabels > 0 && (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              Cost of shipping labels:{" "}
              <span className="flex gap-1 text-red-500">
                {" "}
                - <Currency value={totalCostOfLabels ?? 0} />
              </span>
            </div>
          </div>
        )}
        <div className="mt-5 flex flex-col space-y-2">
          <div className="flex items-center justify-between font-semibold">
            You made:
            <span className="flex gap-1 ">
              <Currency value={(total ?? 0) - (fee ?? 0) - totalCostOfLabels} />
            </span>
          </div>
        </div>

        {paymentMethod === "STRIPE" && (
          <>
            <Separator className="my-4" />
            <h4 className="my-4 text-lg font-semibold">Stripe Information:</h4>
            <p className="flex items-center gap-1">
              Payment Reference:{" "}
              <Link
                href={`${env.NEXT_PUBLIC_STRIPE_PAYMENT_INTENT_URL}${referenceNumber}`}
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "m-0 flex p-0 text-left text-purple-500"
                )}
              >
                Click to view
              </Link>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
