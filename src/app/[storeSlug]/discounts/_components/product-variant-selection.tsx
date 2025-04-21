import type { UseFormReturn } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDownIcon, ChevronRightIcon, PencilIcon } from "lucide-react";

import type { DiscountFormData } from "~/lib/validators/discount";
import type { Product, Variation } from "~/types/product";
import { env } from "~/env";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

type VariantWithSelection = Variation & {
  isSelected: boolean;
};

type ProductWithSelection = Omit<Product, "variants"> & {
  isSelected: boolean;
  variants: VariantWithSelection[];
};

export const ProductVariantSelection = ({
  form,
  isLoading,
  products,
}: {
  form: UseFormReturn<DiscountFormData>;
  isLoading: boolean;
  products: Product[];
}) => {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set(),
  );
  const [selectedProducts, setSelectedProducts] = useState<
    ProductWithSelection[]
  >([]);

  // Initialize selection state from form data
  useEffect(() => {
    const selectedVariantIds = new Set(
      form.getValues("variants").map((v) => v.id),
    );

    setSelectedProducts(
      products.map((product) => {
        const productVariants = product.variants.map((variant) => ({
          ...variant,
          isSelected: selectedVariantIds.has(variant.id),
        }));

        // Product is selected if all its variants are selected
        const allVariantsSelected = productVariants.every((v) => v.isSelected);

        return {
          ...product,
          isSelected: allVariantsSelected,
          variants: productVariants,
        };
      }),
    );
  }, [products, form]);

  const toggleProductExpansion = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          const newIsSelected = !product.isSelected;
          return {
            ...product,
            isSelected: newIsSelected,
            variants: product.variants.map((variant) => ({
              ...variant,
              isSelected: newIsSelected,
            })),
          };
        }
        return product;
      }),
    );
  };

  const toggleVariantSelection = (productId: string, variantId: string) => {
    setSelectedProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          const updatedVariants = product.variants.map((variant) =>
            variant.id === variantId
              ? { ...variant, isSelected: !variant.isSelected }
              : variant,
          );

          // Check if all variants are selected
          const allVariantsSelected = updatedVariants.every(
            (v) => v.isSelected,
          );

          return {
            ...product,
            isSelected: allVariantsSelected,
            variants: updatedVariants,
          };
        }
        return product;
      }),
    );
  };

  const selectedVariantCount = useMemo(() => {
    return selectedProducts.reduce(
      (count, product) =>
        count + product.variants.filter((v) => v.isSelected).length,
      0,
    );
  }, [selectedProducts]);

  const handleSave = () => {
    const selectedVariants = selectedProducts
      .flatMap((product) =>
        product.variants.filter((variant) => variant.isSelected),
      )
      .map((variant) => ({ id: variant.id }));

    form.setValue("variants", selectedVariants);
  };

  const handleCancel = () => {
    // Reset to form values
    const selectedVariantIds = new Set(
      form.getValues("variants").map((v) => v.id),
    );

    setSelectedProducts(
      products.map((product) => {
        const productVariants = product.variants.map((variant) => ({
          ...variant,
          isSelected: selectedVariantIds.has(variant.id),
        }));

        const allVariantsSelected = productVariants.every((v) => v.isSelected);

        return {
          ...product,
          isSelected: allVariantsSelected,
          variants: productVariants,
        };
      }),
    );
  };

  return (
    <div className="col-span-full">
      <Dialog>
        <DialogTrigger asChild disabled={isLoading}>
          <div className="hover:bg-accent/50 flex cursor-pointer items-center justify-between rounded-md border border-dashed p-3 transition-all hover:border-solid">
            <div className="space-y-1">
              <h3 className="flex items-center text-base font-semibold">
                Manage Products & Variants
                {selectedVariantCount > 0 && (
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-100">
                    {selectedVariantCount} variants selected
                  </span>
                )}
              </h3>
              <p className="text-muted-foreground text-sm">
                {selectedVariantCount > 0
                  ? "Click to edit the selected variants"
                  : "No variants selected. Select products or individual variants to apply the discount."}
              </p>
            </div>
            <div className="bg-primary/10 ml-auto rounded-full p-2">
              <PencilIcon className="text-primary h-4 w-4" />
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <div className="flex items-center justify-between pb-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </DialogClose>
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button type="button" size="sm" onClick={handleSave}>
                    Save Selection
                  </Button>
                </DialogClose>
              </div>
            </div>
            <DialogTitle>Select Products & Variants</DialogTitle>
            <DialogDescription>
              Select entire products or individual variants to apply the
              discount to.
            </DialogDescription>
          </DialogHeader>

          <div className="my-5 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              {selectedProducts.map((product) => (
                <div key={product.id} className="rounded-lg border p-4">
                  <div className="flex items-center gap-4">
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

                    <Checkbox
                      checked={product.isSelected}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                    />

                    <div className="flex items-center gap-2">
                      <div className="border-border relative aspect-square h-10 overflow-hidden rounded-md border">
                        <Image
                          src={`${env.NEXT_PUBLIC_STORAGE_URL}/products/${product.featuredImage ?? "placeholder-image.webp"}`}
                          fill
                          className="object-cover"
                          alt={`Image for ${product.name}`}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-muted-foreground text-sm">
                          {product.variants.length} variants
                        </p>
                      </div>
                    </div>
                  </div>

                  {expandedProducts.has(product.id) && (
                    <div className="mt-4 space-y-2 pl-12">
                      {product.variants.map((variant) => (
                        <div
                          key={variant.id}
                          className="flex items-center gap-4 rounded-md border p-2"
                        >
                          <Checkbox
                            checked={variant.isSelected}
                            onCheckedChange={() =>
                              toggleVariantSelection(product.id, variant.id)
                            }
                          />
                          <div>
                            <p className="text-sm font-medium">
                              {variant.name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              SKU: {variant.sku ?? "N/A"}
                            </p>
                          </div>
                          <div className="ml-auto text-sm">
                            {variant.compareAtPriceInCents ? (
                              <>
                                <p className="text-muted-foreground line-through">
                                  $
                                  {(
                                    variant.compareAtPriceInCents / 100
                                  ).toFixed(2)}
                                </p>
                                <p className="text-muted-foreground">
                                  ${(variant.priceInCents / 100).toFixed(2)}
                                </p>
                              </>
                            ) : (
                              <p className="text-muted-foreground">
                                ${(variant.priceInCents / 100).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
