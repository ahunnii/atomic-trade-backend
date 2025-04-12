"use client";

import type { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import Image from "next/image";
import { XIcon } from "lucide-react";

import type { ProductOrderFormData } from "~/lib/validators/order";
import type { Product, Variation } from "~/types/product";
import { env } from "~/env";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";

interface ProductSelectDialogProps {
  products: Product[];
  previousProducts: {
    variantId: string;
    productId: string;
    product: Product | null;
    variant: Variation | null;
  }[];
  isOpen: boolean;
  onClose: () => void;
  // onConfirm: (
  //   products: {
  //     variantId: string;
  //     productId: string;
  //     product: Product | null;
  //     variant: Variation | null;
  //   }[],
  // ) => void;
  form: UseFormReturn<ProductOrderFormData>;
}

export const ProductSelectDialog = ({
  products,
  isOpen,
  onClose,

  previousProducts,
  form,
}: ProductSelectDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<
    {
      variantId: string;
      productId: string;
      product: Product | null;
      variant: Variation | null;
    }[]
  >(previousProducts ?? []);
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectVariant = (product: Product, variantId: string) => {
    const existingIndex = selectedProducts.findIndex(
      (item) => item.variantId === variantId,
    );

    if (existingIndex >= 0) {
      // If already selected, remove it
      setSelectedProducts(
        selectedProducts.filter((_, index) => index !== existingIndex),
      );
    } else {
      const variant = product.variants.find(
        (variant) => variant.id === variantId,
      );
      // Add to selection
      setSelectedProducts([
        ...selectedProducts,
        { variantId, productId: product.id, product, variant: variant! },
      ]);
    }
  };

  const isVariantSelected = (variantId: string) => {
    return selectedProducts.some((item) => item.variantId === variantId);
  };

  const handleConfirm = () => {
    // Get current items from the form
    const currentItems = form.getValues("orderItems") ?? [];

    // Filter out product items that are no longer selected
    const remainingItems = currentItems.filter((item) => {
      // Keep custom items (no variantId)
      if (!item.variantId) return true;
      // Keep product items that are still selected
      return selectedProducts.some(
        (selected) => selected.variantId === item.variantId,
      );
    });

    // Add new product items that weren't already in the form
    const newItems = selectedProducts
      .filter(
        (selected) =>
          !currentItems.some((item) => item.variantId === selected.variantId),
      )
      .map((product) => ({
        variantId: product.variantId,
        productId: product.productId,
        quantity: 1,
        name: product.product!.name,
        description: product.variant!.name,
        unitPriceInCents: product.variant!.priceInCents,
        discountInCents: 0,
        totalPriceInCents: product.variant!.priceInCents * 1,
        isPhysical: true,
        chargeTax: true,
        discountType: "amount" as const,
      }));

    // Update the form with the combined items
    form.setValue("orderItems", [...remainingItems, ...newItems]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px]"
        onInteractOutside={() => {
          setSelectedProducts(previousProducts);
        }}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              All products{" "}
              {selectedProducts.filter((p) => p.productId && p.variantId)
                .length > 0
                ? `(${selectedProducts.filter((p) => p.productId && p.variantId).length} selected)`
                : ""}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" type="button">
                <XIcon className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          <div className="flex items-center gap-2 py-4">
            <Input
              placeholder="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
            <Button variant="outline" className="h-9" type="button">
              Filter
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="space-y-2">
                {/* Product Header - Only show if multiple variants */}
                {product.variants.length > 1 && (
                  <div className="flex items-center gap-3 py-1">
                    <Checkbox disabled />
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-md border">
                        <Image
                          src={`${env.NEXT_PUBLIC_STORAGE_URL}/products/${product.featuredImage}`}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {product.variants.length} variants available
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Variants or Single Product */}
                <div className="space-y-2 pl-0">
                  {product.variants.length === 1 ? (
                    // Single variant product
                    <section
                      onClick={() =>
                        handleSelectVariant(
                          product,
                          product.variants[0]?.id ?? "",
                        )
                      }
                      className="hover:bg-accent flex w-full items-center gap-3 rounded-md p-2 transition-colors"
                    >
                      <Checkbox
                        type="button"
                        checked={isVariantSelected(
                          product.variants[0]?.id ?? "",
                        )}
                      />
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-md border">
                          <Image
                            src={product.featuredImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col items-start text-left">
                          <p className="font-medium">{product.name}</p>
                          <div className="flex items-center gap-4">
                            <p className="text-muted-foreground text-sm">
                              {product.variants[0]?.stock ?? "Unlimited"}{" "}
                              available
                            </p>
                            <p className="font-medium">
                              $
                              {(
                                (product.variants[0]?.priceInCents ?? 0) / 100
                              ).toFixed(2)}{" "}
                              USD
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  ) : (
                    // Multiple variants
                    <div className="space-y-2 pl-7">
                      {product.variants.map((variant) => (
                        <section
                          key={variant.id}
                          onClick={() =>
                            handleSelectVariant(product, variant.id)
                          }
                          className="hover:bg-accent flex w-full items-center gap-3 rounded-md p-2 transition-colors"
                        >
                          <Checkbox
                            type="button"
                            checked={isVariantSelected(variant.id)}
                          />
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-md border">
                              <Image
                                src={`${env.NEXT_PUBLIC_STORAGE_URL}/products/${variant.imageUrl ?? product.featuredImage}`}
                                alt={`${product.name} - ${variant.name ?? "Default"}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col items-start text-left">
                              <p className="font-medium">{variant.name}</p>
                              <div className="flex items-center gap-4">
                                <p className="text-muted-foreground text-sm">
                                  {variant.stock ?? "Unlimited"} available
                                </p>
                                <p className="font-medium">
                                  $
                                  {((variant.priceInCents ?? 0) / 100).toFixed(
                                    2,
                                  )}{" "}
                                  USD
                                </p>
                              </div>
                            </div>
                          </div>
                        </section>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedProducts(previousProducts);
              onClose();
            }}
            type="button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            type="button"
            // disabled={
            //   selectedProducts.filter((p) => p.productId && p.variantId)
            //     .length === 0
            // }
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
