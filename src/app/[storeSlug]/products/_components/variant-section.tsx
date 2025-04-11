import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";

import type { ProductFormData } from "~/lib/validators/product";

import { ProductVariantDialog } from "./product-variant-dialog";

type Props = {
  form: UseFormReturn<ProductFormData>;
  loading: boolean;
};

export const VariantSection = ({ form, loading }: Props) => {
  const { fields } = useFieldArray({
    control: form.control,
    name: `variants` as const,
  });

  // Get watched values
  const firstVariantPrice = form.watch("variants.0.priceInCents");
  const firstVariantManageStock = form.watch("variants.0.manageStock");
  const firstVariantStock = form.watch("variants.0.stock");

  // Check if all variants have the same price
  const allSamePrice =
    fields.length > 0 &&
    fields.every((field) => field.priceInCents === firstVariantPrice);

  // Check if all variants have the same inventory settings
  const allSameInventorySettings =
    fields.length > 0 &&
    fields.every(
      (field) =>
        field.manageStock === firstVariantManageStock &&
        (!field.manageStock || field.stock === firstVariantStock),
    );

  // Format price for display
  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(priceInCents / 100);
  };

  return (
    <section className="col-span-full">
      <div className="mb-5 gap-1 md:grid md:grid-cols-1">
        {fields.length > 5 ? (
          <div className="rounded-md border p-3 text-center">
            <h3 className="font-medium">{fields.length} Variants</h3>
            <p className="text-muted-foreground text-sm">
              Open variant manager to view all
            </p>
            <div className="mt-2 flex flex-row justify-center gap-4">
              {allSamePrice ? (
                <div className="flex items-center justify-center gap-1">
                  <span className="font-medium">Prices:</span>
                  <span>{formatPrice(firstVariantPrice)}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <span className="font-medium">Prices:</span>
                  <span>Varies</span>
                </div>
              )}

              {allSameInventorySettings ? (
                <div className="flex items-center justify-center gap-1">
                  <span className="font-medium">Inventory:</span>
                  <span>
                    {firstVariantManageStock
                      ? `${firstVariantStock || 0} in stock`
                      : "∞ Unlimited"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <span className="font-medium">Inventory:</span>
                  <span>Varies</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          fields.map((field) => (
            <div
              key={field.id}
              className="flex flex-col gap-1 rounded-md border p-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {field.name || "Unnamed Variant"}
                </h3>
                <div className="text-muted-foreground text-sm">
                  SKU: {!!field.sku ? field.sku : "Not specified"}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Price:</span>
                  <span>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(field.priceInCents / 100) || "$0.00"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Inventory:</span>
                  {field.manageStock ? (
                    <span>{field.stock || 0} in stock</span>
                  ) : (
                    <span>∞ Unlimited</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <ProductVariantDialog form={form} loading={loading} />
    </section>
  );
};
