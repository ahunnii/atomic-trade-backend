"use client";

import { useEffect, useState } from "react";

import { toastService } from "@dreamwalker-studios/toasts";

import type { Order } from "~/types/order";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";

type Props = { orders: Order[] };

export function CreateCheckoutSession({ orders }: Props) {
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string>("");

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["payment"],
  });

  useEffect(() => {
    if (selectedOrderId) {
      const order = orders.find((o) => o.id === selectedOrderId);
      setSelectedOrder(order ?? null);
    } else {
      setSelectedOrder(null);
    }
  }, [selectedOrderId, orders]);

  const createCheckoutSession = api.payment.createCheckoutSession.useMutation({
    ...defaultActions,
    onSuccess: ({ data, message }) => {
      defaultActions.onSuccess({ message });
      setSessionUrl(data.sessionUrl);
    },
  });

  const handleCreateCheckoutSession = () => {
    if (selectedOrderId) {
      createCheckoutSession.mutate(selectedOrderId);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="order-select" className="text-sm font-medium">
          Select an order
        </label>
        <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
          <SelectTrigger id="order-select" className="w-full">
            <SelectValue placeholder="Select an order" />
          </SelectTrigger>
          <SelectContent>
            {orders.map((order) => (
              <SelectItem key={order.id} value={order.id}>
                Order #{order.orderNumber} - $
                {(order.totalInCents / 100).toFixed(2)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedOrder && (
        <Card>
          <CardHeader>
            <CardTitle>Order vs Stripe Checkout Comparison</CardTitle>
            <CardDescription>
              Compare how order data will be transformed for Stripe checkout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="mb-2 font-medium">Order Data</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="font-medium">Order Number:</span>{" "}
                    {selectedOrder.orderNumber}
                  </li>
                  <li>
                    <span className="font-medium">Total:</span> $
                    {(selectedOrder.totalInCents / 100).toFixed(2)}
                  </li>
                  <li>
                    <span className="font-medium">Items:</span>{" "}
                    {selectedOrder.orderItems?.length || 0}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Stripe Checkout Data</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="font-medium">Mode:</span> payment
                  </li>
                  <li>
                    <span className="font-medium">Payment Methods:</span> card
                  </li>
                  <li>
                    <span className="font-medium">Line Items:</span> Variants
                    with price data
                  </li>
                </ul>
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <h3 className="mb-2 font-medium">Line Item Transformation</h3>
              <div className="space-y-2 text-sm">
                <p>For each order item:</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    Variant data is fetched from database including product info
                  </li>
                  <li>Stock availability is checked if stock is managed</li>
                  <li>
                    Stripe line item is created with:
                    <ul className="mt-1 list-disc pl-5">
                      <li>Currency: USD</li>
                      <li>Product name from variant&apos;s product</li>
                      <li>Product image from featured image</li>
                      <li>
                        Unit amount from compareAtPriceInCents or priceInCents
                      </li>
                      <li>Quantity from order item</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleCreateCheckoutSession}
        disabled={!selectedOrderId || createCheckoutSession.isPending}
      >
        {createCheckoutSession.isPending
          ? "Creating..."
          : "Create Checkout Session"}
      </Button>

      {sessionUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Checkout Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md bg-gray-100 p-4">
                <p className="font-mono text-sm break-all">{sessionUrl}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  void navigator.clipboard.writeText(sessionUrl);
                  toastService.success(
                    "Checkout session URL copied to clipboard",
                  );
                }}
              >
                Copy URL
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
