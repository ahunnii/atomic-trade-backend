"use client";

import type { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { useFieldArray } from "react-hook-form";

import type { PreviousProduct } from "../../_components/order-items/product-select-dialog";
import type { DraftOrderFormData } from "~/lib/validators/order";
import type { Product } from "~/types/product";
import { env } from "~/env";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

import { CustomOrderItemDialog } from "../../_components/order-items/custom-order-item-dialog";
import { ProductSelectDialog } from "../../_components/order-items/product-select-dialog";
import { DiscountDialog } from "../../_components/payments/discount-dialog";

type Props = {
  form: UseFormReturn<DraftOrderFormData>;
  products: Product[];
  loading: boolean;
};

export const DraftOrderItemSection = ({ form, loading, products }: Props) => {
  const { fields, remove, append, update } = useFieldArray({
    control: form.control,
    name: `orderItems`,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const total = fields.reduce(
    (sum, field) => sum + (field.totalPriceInCents || 0) * field.quantity,
    0,
  );

  const previousProducts = fields.map((field) => {
    // If it's a custom item (no variantId), return just the basic info
    if (!field.variantId) {
      return {
        variantId: field.variantId,
        productId: field.productId,
        product: null,
        variant: null,
      };
    }

    // Otherwise, find the product and variant
    const product = products.find((product) =>
      product.variants.some((variant) => variant.id === field.variantId),
    )!;
    const variant = product.variants.find(
      (variant) => variant.id === field.variantId,
    )!;
    return {
      variantId: field.variantId,
      productId: product?.id ?? "",
      product,
      variant,
    };
  });

  return (
    <Card className="space-y-6 px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Products</h2>
        <div className="flex gap-2">
          <CustomOrderItemDialog
            form={form}
            loading={loading}
            append={append}
          />{" "}
          <Button onClick={() => setIsDialogOpen(true)} type="button">
            Add Products
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="grid grid-cols-12 gap-4 border-b bg-gray-50 p-4">
          <div className="col-span-6">Product</div>
          <div className="col-span-3 text-right">Quantity</div>
          <div className="col-span-2 text-right">Total</div>
          <div className="col-span-1"></div>
        </div>

        {fields.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No products added yet
          </div>
        ) : (
          <div className="divide-y">
            {fields.map((field, index) => {
              // For custom items, we don't need to find a product
              const isCustomItem = !field.variantId;
              const product = isCustomItem
                ? null
                : products.find((product) => product.id === field.productId);

              return (
                <div
                  key={field.id}
                  className="grid grid-cols-12 items-center gap-4 p-4"
                >
                  <div className="col-span-6">
                    <div className="flex items-center gap-3">
                      {!isCustomItem && (
                        <div className="relative h-12 w-12 rounded bg-gray-100">
                          <Image
                            src={`${env.NEXT_PUBLIC_STORAGE_URL}/products/${product?.featuredImage}`}
                            alt={field.name}
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {field.name}
                          </h4>
                          {isCustomItem && (
                            <CustomOrderItemDialog
                              form={form}
                              loading={loading}
                              append={append}
                              field={field}
                              update={update}
                              fieldIndex={index}
                            />
                          )}
                        </div>
                        {field.description && (
                          <p className="mt-0.5 text-sm text-gray-500">
                            {field.description}
                          </p>
                        )}
                        <div className="mt-1 text-sm font-medium text-gray-600">
                          {field.discountInCents > 0 ? (
                            <div className="flex items-center gap-0.5">
                              <DiscountDialog
                                form={form}
                                loading={loading}
                                orderItemIndex={index}
                                initialData={{
                                  discountType: field.discountType ?? "amount",
                                  discountValue: field.discountInCents,
                                  reason: field.discountReason,
                                }}
                              >
                                <span className="cursor-pointer text-blue-600 hover:text-blue-700 hover:underline">
                                  {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                  }).format(
                                    ((field.unitPriceInCents || 0) -
                                      field.discountInCents) /
                                      100,
                                  )}
                                </span>
                              </DiscountDialog>

                              <span className="ml-2 text-gray-400 line-through">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                }).format((field.unitPriceInCents || 0) / 100)}
                              </span>
                            </div>
                          ) : (
                            <DiscountDialog
                              form={form}
                              loading={loading}
                              orderItemIndex={index}
                              initialData={{
                                discountType: field.discountType,
                                discountValue: field.discountInCents,
                                reason: field.discountReason,
                              }}
                            >
                              <span className="cursor-pointer text-blue-600 hover:text-blue-700 hover:underline">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                }).format((field.totalPriceInCents || 0) / 100)}
                              </span>
                            </DiscountDialog>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 text-right">
                    <div className="inline-flex items-center rounded-md border">
                      <button
                        className="px-2 py-1 hover:bg-gray-100"
                        type="button"
                        onClick={() => {
                          update(index, {
                            ...field,
                            quantity: field.quantity - 1,
                          });
                        }}
                      >
                        -
                      </button>
                      <span className="border-x px-4 py-1">
                        {field.quantity}
                      </span>
                      <button
                        className="px-2 py-1 hover:bg-gray-100"
                        type="button"
                        onClick={() => {
                          update(index, {
                            ...field,
                            quantity: field.quantity + 1,
                          });
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2 text-right font-medium">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(
                      ((field.totalPriceInCents || 0) * field.quantity) / 100,
                    )}
                  </div>
                  <div className="col-span-1 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {fields.length > 0 && (
        <div className="flex justify-end">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-lg font-medium">
              <span>Total</span>
              <span>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(total / 100)}
              </span>
            </div>
          </div>
        </div>
      )}

      <ProductSelectDialog
        form={form}
        products={products}
        previousProducts={(previousProducts as PreviousProduct[]) ?? []}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Card>
  );
};
