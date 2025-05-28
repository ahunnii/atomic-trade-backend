"use client";

import { useEffect, useState } from "react";

import type { Cart, CartItem as DBCartItem } from "@prisma/client";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";

type Props = {
  carts: (Cart & { cartItems: DBCartItem[] })[];
  storeId: string;
};

type CartItem = {
  id: string;
  variantId: string;
  quantity: number;
  variant: {
    id: string;
    priceInCents: number;
    compareAtPriceInCents: number | null;
  };
  appliedDiscounts?: {
    id: string;
    code: string;
    type: "PRODUCT" | "ORDER" | "SHIPPING";
  }[];
};

type DiscountCalculationResult = {
  originalCartItems: CartItem[];
  updatedCartItems: CartItem[];
  productDiscountInCents: number;
  discountedShipping: number;
  orderDiscountInCents: number;
  totalAfterDiscounts: number;
  appliedDiscounts: Array<{
    id: string;
    code: string;
    type: "PRODUCT" | "ORDER" | "SHIPPING";
  }>;
  itemDiscountMap: Record<string, number>;
  originalSubtotal: number;
};

export function TestCartDiscounts({ carts, storeId }: Props) {
  const [selectedCartId, setSelectedCartId] = useState<string>("");

  // const [cartCalculationResult, setCartCalculationResult] =
  //   useState<DiscountCalculationResult | null>(null);
  const [paymentSession, setPaymentSession] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string>("");

  const calculateCartDiscounts = api.payment.checkout.useMutation({
    onSuccess: ({ data }) => {
      setPaymentSession(data.sessionUrl);
    },
  });

  const handleCalculateCartDiscounts = () => {
    if (selectedCartId) {
      calculateCartDiscounts.mutate({
        cartId: selectedCartId,
        couponCode: couponCode || undefined,
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Test Carts</CardTitle>
          <CardDescription>
            Select product variants and quantities to test discount calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="space-y-2">
                <Label htmlFor="coupon-code">Coupon Code</Label>
                <Input
                  id="coupon-code"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
              </div>

              <label htmlFor="order-select" className="text-sm font-medium">
                Select a cart
              </label>
              <Select value={selectedCartId} onValueChange={setSelectedCartId}>
                <SelectTrigger id="order-select" className="w-full">
                  <SelectValue placeholder="Select an order" />
                </SelectTrigger>
                <SelectContent>
                  {carts.map((cart) => (
                    <SelectItem key={cart.id} value={cart.id}>
                      Cart #{cart.id} -{" "}
                      {cart.cartItems?.reduce(
                        (acc, curr) => acc + curr.quantity,
                        0,
                      )}
                      items
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button
                onClick={handleCalculateCartDiscounts}
                disabled={!selectedCartId || calculateCartDiscounts.isPending}
              >
                {calculateCartDiscounts.isPending
                  ? "Calculating..."
                  : "Calculate Discounts"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCartId("");
                  setCouponCode("");
                  // setCartCalculationResult(null);
                  setPaymentSession(null);
                }}
              >
                Clear Selection
              </Button>
            </div>
            {paymentSession && (
              <div className="mt-4 space-y-4">
                <Separator />
                <h3 className="font-medium">Payment Session</h3>
                <a
                  href={paymentSession}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {paymentSession}
                </a>
              </div>
            )}

            {/* {cartCalculationResult && (
              <div className="mt-4 space-y-4">
                <Separator />
                <h3 className="font-medium">Calculation Results</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Original Subtotal:</span>
                    <span>
                      $
                      {(cartCalculationResult?.originalSubtotal / 100).toFixed(
                        2,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discounted Subtotal:</span>
                    <span>
                      $
                      {(
                        (cartCalculationResult.totalAfterDiscounts -
                          cartCalculationResult.discountedShipping) /
                        100
                      ).toFixed(2)}
                    </span>
                  </div>
                  {cartCalculationResult.orderDiscountInCents > 0 && (
                    <div className="text-muted-foreground flex justify-between pl-5 text-xs">
                      <span>Order Discount:</span>
                      <span>
                        -$
                        {(
                          cartCalculationResult.orderDiscountInCents / 100
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {cartCalculationResult.orderDiscountInCents > 0 && (
                    <div className="text-muted-foreground flex justify-between pl-5 text-xs">
                      <span>Product Discount:</span>
                      <span>
                        -$
                        {(
                          cartCalculationResult.productDiscountInCents / 100
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {cartCalculationResult.discountedShipping === 0 && (
                    <div className="flex justify-between">
                      <span>Shipping Discount:</span>
                      <span>Free Shipping</span>
                    </div>
                  )}

                  {cartCalculationResult.discountedShipping > 0 && (
                    <div className="flex justify-between">
                      <span>Shipping Discount:</span>
                      <span>
                        $
                        {(
                          cartCalculationResult.discountedShipping / 100
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>
                      $
                      {(
                        cartCalculationResult.totalAfterDiscounts / 100
                      ).toFixed(2)}
                    </span>
                  </div>
                  {cartCalculationResult.appliedDiscounts.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium">Applied Discounts:</h4>
                      <ul className="mt-2 space-y-1">
                        {cartCalculationResult.appliedDiscounts.map(
                          (discount) => (
                            <li key={discount.id} className="text-sm">
                              {discount.code} ({discount.type})
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )} */}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
