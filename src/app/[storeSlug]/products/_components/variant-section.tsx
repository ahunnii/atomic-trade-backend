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

  return (
    <section className="col-span-full">
      <div className="mb-5 gap-1 md:grid md:grid-cols-1">
        {fields.length > 5 ? (
          <div className="rounded-md border p-3 text-center">
            <h3 className="font-medium">{fields.length} Variants</h3>
            <p className="text-muted-foreground text-sm">
              Open variant manager to view all
            </p>
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
                  SKU: {field.sku ?? "Not specified"}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Price:</span>
                  <span>{field.priceInCents || "$0.00"}</span>
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
