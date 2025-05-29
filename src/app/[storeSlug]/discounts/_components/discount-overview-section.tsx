import type { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";

import { DiscountAmountType, DiscountType } from "@prisma/client";

import type { DiscountFormData } from "~/lib/validators/discount";
import { Badge } from "~/components/ui/badge";
import { FormCardSection } from "~/components/shared/form-card-section";

type Props = {
  form: UseFormReturn<DiscountFormData>;
};

export const DiscountOverviewSection = ({ form }: Props) => {
  const watchedValues = form.watch();

  const getDiscountTypeLabel = (type: DiscountType) => {
    switch (type) {
      case DiscountType.PRODUCT:
        return "Amount off products";
      case DiscountType.ORDER:
        return "Amount off order";
      case DiscountType.SHIPPING:
        return "Free shipping";
      default:
        return "Unknown type";
    }
  };

  const getAmountLabel = () => {
    if (watchedValues.amountType === DiscountAmountType.PERCENTAGE) {
      return `${watchedValues.amount}% off`;
    } else {
      return `$${(watchedValues.amount / 100).toFixed(2)} off`;
    }
  };

  const getMinimumRequirementLabel = () => {
    switch (watchedValues.minimumRequirementType) {
      case "QUANTITY":
        return `Minimum purchase of ${watchedValues.minimumQuantity} items`;
      case "PURCHASE":
        return `Minimum purchase of $${((watchedValues.minimumPurchaseInCents ?? 0) / 100).toFixed(2)}`;
      default:
        return "No minimum requirements";
    }
  };

  const getCombinationRules = () => {
    const rules = [];
    if (!watchedValues.combineWithProductDiscounts)
      rules.push("product discounts");
    if (!watchedValues.combineWithOrderDiscounts) rules.push("order discounts");
    if (!watchedValues.combineWithShippingDiscounts)
      rules.push("shipping discounts");

    if (rules.length === 0) return "Can combine with other discounts";
    return `Can't combine with ${rules.join(", ")}`;
  };

  const getActiveTimeframe = () => {
    const start = watchedValues.startsAt
      ? format(new Date(watchedValues.startsAt), "MMM d, yyyy")
      : "now";
    const end = watchedValues.endsAt
      ? format(new Date(watchedValues.endsAt), "MMM d, yyyy")
      : "no end date";
    return `Active from ${start} until ${end}`;
  };

  return (
    <FormCardSection title="Summary">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{watchedValues.code}</h2>
          <Badge
            variant={watchedValues.isActive ? "default" : "outline"}
            className={
              watchedValues.isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                : ""
            }
          >
            {watchedValues.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Type and method</h3>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>{getDiscountTypeLabel(watchedValues.type)}</li>
              <li>
                {watchedValues.isAutomatic ? "Automatic" : "Code required"}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold">Details</h3>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>For Online Store</li>
              <li>{getAmountLabel()}</li>
              <li>{getMinimumRequirementLabel()}</li>
              <li>{getCombinationRules()}</li>
              <li>{getActiveTimeframe()}</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold">Performance</h3>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>0 used</li>
            </ul>
          </div>
        </div>
      </div>
    </FormCardSection>
  );
};
