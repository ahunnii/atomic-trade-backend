"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

import { toastService } from "@dreamwalker-studios/toasts";

import type { Order } from "~/types/order";
import type { Product, Variation } from "~/types/product";
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

type Props = { orders: Order[]; storeId: string };

type CartItem = {
  variantId: string;
  quantity: number;
  priceInCents: number;
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
};

export function TestDiscounts({ orders, storeId }: Props) {
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string>("");
  const [selectedVariants, setSelectedVariants] = useState<
    Array<{ variantId: string; quantity: number }>
  >([]);
  const [calculationResult, setCalculationResult] =
    useState<DiscountCalculationResult | null>(null);
  const [couponCode, setCouponCode] = useState<string>("");
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set(),
  );

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["payment"],
  });

  const { data: products } = api.product.getAll.useQuery({ storeId });

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

  const calculateDiscounts = api.discount.calculateItems.useMutation({
    onSuccess: ({ data }) => {
      setCalculationResult(data);
    },
  });

  const handleCreateCheckoutSession = () => {
    if (selectedOrderId) {
      createCheckoutSession.mutate(selectedOrderId);
    }
  };

  const handleCalculateDiscounts = () => {
    if (selectedVariants.length > 0) {
      calculateDiscounts.mutate({
        storeId,
        cartItems: selectedVariants,
        couponCode: couponCode || undefined,
      });
    }
  };

  const handleVariantQuantityChange = (variantId: string, quantity: number) => {
    setSelectedVariants((prev) => {
      const existingIndex = prev.findIndex((v) => v.variantId === variantId);
      if (existingIndex >= 0) {
        if (quantity === 0) {
          return prev.filter((v) => v.variantId !== variantId);
        }
        const updated = [...prev];
        updated[existingIndex] = { variantId, quantity };
        return updated;
      }
      return [...prev, { variantId, quantity }];
    });
  };

  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
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

      <Card>
        <CardHeader>
          <CardTitle>Test Discounts</CardTitle>
          <CardDescription>
            Select product variants and quantities to test discount calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coupon-code">Coupon Code</Label>
              <Input
                id="coupon-code"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {products?.map((product) => (
                <div key={product.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleProductExpansion(product.id)}
                    >
                      {expandedProducts.has(product.id) ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </Button>
                    <h4 className="font-medium">{product.name}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const productVariants = product.variants.map((v) => ({
                          variantId: v.id,
                          quantity: 1,
                        }));
                        setSelectedVariants((prev) => {
                          const existingVariants = prev.filter(
                            (v) =>
                              !productVariants.some(
                                (pv) => pv.variantId === v.variantId,
                              ),
                          );
                          return [...existingVariants, ...productVariants];
                        });
                      }}
                    >
                      Add All Variants
                    </Button>
                  </div>
                  {expandedProducts.has(product.id) && (
                    <div className="space-y-2 pl-8">
                      {product.variants.map((variant) => (
                        <div
                          key={variant.id}
                          className="flex items-center gap-4"
                        >
                          <div className="flex-1">
                            <Label htmlFor={`quantity-${variant.id}`}>
                              {variant.name} -{" "}
                              {variant.compareAtPriceInCents ? (
                                <>
                                  <span className="mr-1 line-through">
                                    $
                                    {(
                                      variant.compareAtPriceInCents / 100
                                    ).toFixed(2)}
                                  </span>
                                  ${(variant.priceInCents / 100).toFixed(2)}
                                </>
                              ) : (
                                `$${(variant.priceInCents / 100).toFixed(2)}`
                              )}
                            </Label>
                          </div>
                          <Input
                            id={`quantity-${variant.id}`}
                            type="number"
                            min="0"
                            value={
                              selectedVariants.find(
                                (v) => v.variantId === variant.id,
                              )?.quantity ?? 0
                            }
                            onChange={(e) =>
                              handleVariantQuantityChange(
                                variant.id,
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-20"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button
              onClick={handleCalculateDiscounts}
              disabled={
                selectedVariants.length === 0 || calculateDiscounts.isPending
              }
            >
              {calculateDiscounts.isPending
                ? "Calculating..."
                : "Calculate Discounts"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedVariants([]);
                setCouponCode("");
                setCalculationResult(null);
              }}
            >
              Clear Selection
            </Button>
          </div>

          {calculationResult && (
            <div className="mt-4 space-y-4">
              <Separator />
              <h3 className="font-medium">Calculation Results</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Original Subtotal:</span>
                  <span>
                    $
                    {(
                      calculationResult?.originalCartItems?.reduce(
                        (acc, curr) => acc + curr.priceInCents * curr.quantity,
                        0,
                      ) / 100
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Discounted Subtotal:</span>
                  <span>
                    $
                    {(
                      (calculationResult.totalAfterDiscounts -
                        calculationResult.discountedShipping) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
                {calculationResult.orderDiscountInCents > 0 && (
                  <div className="text-muted-foreground flex justify-between pl-5 text-xs">
                    <span>Order Discount:</span>
                    <span>
                      -$
                      {(calculationResult.orderDiscountInCents / 100).toFixed(
                        2,
                      )}
                    </span>
                  </div>
                )}

                {calculationResult.orderDiscountInCents > 0 && (
                  <div className="text-muted-foreground flex justify-between pl-5 text-xs">
                    <span>Product Discount:</span>
                    <span>
                      -$
                      {(calculationResult.productDiscountInCents / 100).toFixed(
                        2,
                      )}
                    </span>
                  </div>
                )}
                {calculationResult.discountedShipping === 0 && (
                  <div className="flex justify-between">
                    <span>Shipping Discount:</span>
                    <span>Free Shipping</span>
                  </div>
                )}

                {calculationResult.discountedShipping > 0 && (
                  <div className="flex justify-between">
                    <span>Shipping Discount:</span>
                    <span>
                      ${(calculationResult.discountedShipping / 100).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>
                    ${(calculationResult.totalAfterDiscounts / 100).toFixed(2)}
                  </span>
                </div>
                {calculationResult.appliedDiscounts.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium">Applied Discounts:</h4>
                    <ul className="mt-2 space-y-1">
                      {calculationResult.appliedDiscounts.map((discount) => (
                        <li key={discount.id} className="text-sm">
                          {discount.code} ({discount.type})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
