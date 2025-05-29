"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import type { Collection } from "@prisma/client";
import { toastService } from "@dreamwalker-studios/toasts";
import { zodResolver } from "@hookform/resolvers/zod";
import { DiscountAmountType, DiscountType } from "@prisma/client";

import type { DiscountFormData } from "~/lib/validators/discount";
import type { DiscountWithProducts } from "~/types/discount";
import type { ProductWithVariations } from "~/types/product";
import { discountFormValidator } from "~/lib/validators/discount";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Form } from "~/components/ui/form";
import { FormAdditionalOptionsButton } from "~/components/shared/form-additional-options-button";
import { FormDiscardButton } from "~/components/shared/form-discard-button";
import { FormHeader } from "~/components/shared/form-header";
import { FormSaveOptionsButton } from "~/components/shared/form-save-options-button";
import { FormStatusTitle } from "~/components/shared/form-status-title";

import { DiscountActiveSection } from "./discount-active-section";
import { DiscountAmountSection } from "./discount-amount-section";
import { DiscountCombosSection } from "./discount-combos-section";
import { DiscountCountrySelection } from "./discount-country-selection";
import { DiscountMaximumsSection } from "./discount-maximums-section";
import { DiscountMinimumsSection } from "./discount-minimums-section";
import { DiscountOverviewSection } from "./discount-overview-section";
import { DiscountValueSection } from "./discount-value-section";

type Props = {
  initialData: DiscountWithProducts | null;
  collections: Collection[];
  products: ProductWithVariations[];
  storeSlug: string;
  storeId: string;
  type: DiscountType;
};

export const DiscountForm = ({
  initialData,
  products,
  collections,
  storeSlug,
  storeId,
  type,
}: Props) => {
  const router = useRouter();

  const parentPath = `/${storeSlug}/discounts`;

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["discount"],
    redirectPath: parentPath,
  });

  const title = (
    <FormStatusTitle
      hasInitialData={!!initialData}
      title="Discount"
      status={initialData?.isActive ? "ACTIVE" : "INACTIVE"}
    />
  );

  const updateDiscount = api.discount.update.useMutation(defaultActions);
  const createDiscount = api.discount.create.useMutation(defaultActions);
  const deleteDiscount = api.discount.delete.useMutation(defaultActions);

  const updateForDuplication = api.discount.update.useMutation({
    ...defaultActions,
    onSuccess: ({ message }) => {
      defaultActions.onSuccess({ message, cancelRedirect: true });
    },
  });

  const duplicateDiscount = api.discount.duplicate.useMutation({
    ...defaultActions,
    onSuccess: ({ data, message }) => {
      defaultActions.onSuccess({ message, cancelRedirect: true });
      void router.push(`/${storeSlug}/discounts/${data.id}/edit`);
    },
  });

  const form = useForm<DiscountFormData>({
    resolver: zodResolver(discountFormValidator),
    defaultValues: {
      code: initialData?.code ?? "",
      type: initialData?.type ?? type ?? DiscountType.PRODUCT,
      amount: initialData?.amount ?? 0,
      amountType: initialData?.amountType ?? DiscountAmountType.PERCENTAGE,
      isActive: initialData?.isActive ?? false,
      startsAt: initialData?.startsAt ?? new Date(),
      endsAt: initialData?.endsAt ?? undefined,
      minimumRequirementType: initialData?.minimumQuantity
        ? "QUANTITY"
        : initialData?.minimumPurchaseInCents
          ? "PURCHASE"
          : type !== DiscountType.PRODUCT
            ? "NONE"
            : "PURCHASE",

      maximumRequirementType: [
        initialData?.limitOncePerCustomer ? "CUSTOMER" : "",
        initialData?.maximumUses ? "USES" : "",
      ],

      limitOncePerCustomer: initialData?.limitOncePerCustomer ?? false,
      maximumUses: initialData?.maximumUses ?? undefined,
      applyToAllProducts: initialData?.applyToAllProducts ?? false,
      applyToOrder: initialData?.applyToOrder ?? false,
      applyToShipping: initialData?.applyToShipping ?? false,
      isAutomatic: initialData?.isAutomatic ?? false,
      combineWithProductDiscounts:
        initialData?.combineWithProductDiscounts ?? false,
      combineWithOrderDiscounts:
        initialData?.combineWithOrderDiscounts ?? false,
      combineWithShippingDiscounts:
        initialData?.combineWithShippingDiscounts ?? false,

      variants: initialData?.variants ?? [],
      collections: initialData?.collections ?? [],
      customers: initialData?.customers ?? [],

      minimumPurchaseInCents: initialData?.minimumPurchaseInCents ?? 0,
      minimumQuantity: initialData?.minimumQuantity ?? 0,
      countryCodes: initialData?.countryCodes ?? [],

      applyToAllCountries: initialData?.applyToAllCountries ?? false,

      shippingCountryRequirementType: initialData?.applyToAllCountries
        ? "ALL"
        : "SPECIFIC",
    },
  });

  const onSave = async (data: DiscountFormData, publish?: boolean) => {
    if (initialData) {
      updateDiscount.mutate({
        ...data,
        discountId: initialData.id,
        amount: data.type === DiscountType.SHIPPING ? 100 : data.amount,
        amountType:
          data.type === DiscountType.SHIPPING
            ? DiscountAmountType.PERCENTAGE
            : data.amountType,
        isActive: publish ?? false,
      });
    } else {
      createDiscount.mutate({
        ...data,
        storeId,
        amount: data.type === DiscountType.SHIPPING ? 100 : data.amount,
        amountType:
          data.type === DiscountType.SHIPPING
            ? DiscountAmountType.PERCENTAGE
            : data.amountType,
        isActive: publish ?? false,
      });
    }
  };

  const onSubmit = (data: DiscountFormData) => {
    void onSave(data, data?.isActive);
  };

  const onDelete = () => deleteDiscount.mutate(initialData?.id ?? "");

  const onSaveAndDuplicate = async () => {
    const data = form.getValues();

    if (!initialData) {
      toastService.error("Please create a discount first");
      return;
    }

    const savedDiscount = await updateForDuplication.mutateAsync({
      ...data,
      discountId: initialData.id,
    });
    await duplicateDiscount.mutateAsync(savedDiscount.data.id);
  };

  const isLoading =
    updateDiscount.isPending ||
    createDiscount.isPending ||
    deleteDiscount.isPending;

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <FormHeader title={title} link={parentPath}>
            {initialData && (
              <FormAdditionalOptionsButton
                onDelete={onDelete}
                onDuplicate={onSaveAndDuplicate}
              />
            )}

            <FormDiscardButton
              isLoading={isLoading}
              redirectPath={parentPath}
            />

            <FormSaveOptionsButton
              onSave={() => onSave(form.getValues(), false)}
              onPublish={() => onSave(form.getValues(), true)}
              isLoading={isLoading}
            />
          </FormHeader>

          <section className="form-body">
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-7">
              <DiscountAmountSection form={form} />
              {form.watch("type") !== DiscountType.SHIPPING && (
                <DiscountValueSection
                  form={form}
                  products={products}
                  collections={collections}
                  isLoading={isLoading}
                />
              )}
              {form.watch("type") === DiscountType.SHIPPING && (
                <>
                  <DiscountCountrySelection form={form} />
                </>
              )}
              <DiscountMinimumsSection form={form} />

              {(form.watch("type") === DiscountType.ORDER ||
                (form.watch("isAutomatic") === false &&
                  form.watch("type") === DiscountType.PRODUCT)) && (
                <>
                  <DiscountMaximumsSection form={form} />
                </>
              )}

              <DiscountCombosSection form={form} />
              <DiscountActiveSection form={form} />
            </div>
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-5">
              <DiscountOverviewSection form={form} />
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};
