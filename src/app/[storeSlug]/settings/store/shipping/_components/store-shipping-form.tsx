/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect } from "react";
import { checkAndHighlightErrors } from "~/utils/highlight-errors";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import type { ShippingFormData } from "~/lib/validators/store";
import type { Store } from "~/types/store";
import { cn } from "~/lib/utils";
import { shippingSettingsValidator } from "~/lib/validators/store";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Form } from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { AutoCompleteAddressFormField } from "~/components/input/autocomplete-address-form-field";
import { InputFormField } from "~/components/input/input-form-field";
import { NumericFormField } from "~/components/input/numeric-form-field";
import { SingleCheckboxFormField } from "~/components/input/single-checkbox-form-field";
import { SwitchFormField } from "~/components/input/switch-form-field";
import { TextareaFormField } from "~/components/input/textarea-form-field";
import { FormDiscardButton } from "~/components/shared/form-discard-button";
import { FormHeader } from "~/components/shared/form-header";
import { FormSection } from "~/components/shared/form-section";
import { LoadButton } from "~/components/shared/load-button";

type Props = {
  initialData: Store;
  slug: string;
};

export const StoreShippingForm = ({ initialData, slug }: Props) => {
  console.log("initialData", initialData);
  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["store"],
  });

  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSettingsValidator),
    defaultValues: {
      address: {
        formatted: initialData?.address?.formatted ?? "",
        name: initialData?.address?.name ?? initialData?.name ?? "",
        street: initialData?.address?.street ?? "",
        additional: initialData?.address?.additional ?? "",
        city: initialData?.address?.city ?? "",
        state: initialData?.address?.state ?? "",
        postalCode: initialData?.address?.postalCode ?? "",
        country: initialData?.address?.country ?? "",
      },
      hasFreeShipping: initialData?.hasFreeShipping,
      minFreeShipping: initialData?.minFreeShipping ?? 0,
      hasPickup: initialData?.hasPickup,

      hasFlatRate: initialData?.hasFlatRate,
      flatRateAmount: initialData?.flatRateAmount ?? 0,
      showFullAddress: initialData?.showFullAddress ?? false,
      pickupInstructions: initialData?.pickupInstructions ?? undefined,
    },
  });

  const updateStoreShippingSettings =
    api.store.updateStoreShippingSettings.useMutation(defaultActions);

  const onSubmit = (data: ShippingFormData) => {
    updateStoreShippingSettings.mutate({
      storeId: initialData.id,
      address: data?.address,

      hasFreeShipping: data.hasFreeShipping,
      minFreeShipping: data.minFreeShipping ?? undefined,
      hasPickup: data.hasPickup,

      flatRateAmount: data.flatRateAmount ?? undefined,
      hasFlatRate: data.hasFlatRate,
      showFullAddress: data?.showFullAddress ?? false,
      pickupInstructions: data?.pickupInstructions ?? undefined,
    });
  };

  useEffect(() => {
    if (
      form.watch("hasFreeShipping") &&
      (form.watch("minFreeShipping") ?? 0) > 0
    ) {
      form.setValue("hasFlatRate", true);
    }
  }, [form.watch("minFreeShipping"), form.watch("hasFreeShipping")]);

  const highlightErrors = checkAndHighlightErrors({
    form,
    keys: [
      "hasFreeShipping",
      "minFreeShipping",
      "hasFlatRate",
      "flatRateAmount",
    ],
  });

  const toggleShipping = (isFixedShipping: boolean) => {
    if (isFixedShipping) {
      form.setValue("hasFlatRate", true);
      form.setValue("hasFreeShipping", false);
    } else {
      form.setValue("hasFlatRate", false);
      form.setValue("hasFreeShipping", true);
      form.setValue("flatRateAmount", 0);
      form.setValue("minFreeShipping", 0);
    }
  };
  const loading = updateStoreShippingSettings.isPending;
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <FormHeader title="Shipping Settings" link={`/${slug}/dashboard`}>
            <FormDiscardButton
              isLoading={loading}
              redirectPath={`/${slug}/dashboard`}
            />
            <LoadButton isLoading={loading} type="submit">
              Save changes
            </LoadButton>
          </FormHeader>

          <section className="form-body">
            <div className={cn("flex w-full flex-col space-y-4")}>
              <FormSection
                title="Business Address"
                hasError={highlightErrors}
                description="Set your shop's address used for shipping, invoices, and other business needs."
                bodyClassName="space-y-6"
              >
                <InputFormField
                  form={form}
                  name="address.name"
                  label="Return Address Name"
                  placeholder="Store name"
                  description="This is what goes on the packages when you send them to customers."
                />
                <AutoCompleteAddressFormField
                  form={form}
                  name="address.formatted"
                  // labelClassName="text-sm font-normal text-muted-foreground"
                  label="Store address"
                  description="This is where the store is located. Used for billing and shipping purposes."
                  defaultValue={{
                    formatted: form.getValues("address")?.formatted ?? "",
                    street: form.getValues("address")?.street ?? "",
                    city: form.getValues("address")?.city ?? "",
                    state: form.getValues("address")?.state ?? "",
                    postalCode: form.getValues("address")?.postalCode ?? "",
                    country: form.getValues("address")?.country ?? "",
                  }}
                  onSelectAdditional={(address) => {
                    form.setValue("address", address);
                  }}
                />
                <SwitchFormField
                  form={form}
                  name="showFullAddress"
                  label="Show Full Address?"
                  description="If set to false, only the city and state will be shown on the contact page."
                />
              </FormSection>
              <FormSection
                title="Shipping"
                description="Apply shipping rates to this region."
                bodyClassName="space-y-4"
                hasError={highlightErrors}
              >
                <Select
                  onValueChange={(e) => toggleShipping(e === "fixed")}
                  defaultValue={form.watch("hasFlatRate") ? "fixed" : "free"}
                >
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a shipping method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>
                        Select how shipping is calculated:
                      </SelectLabel>
                      <SelectItem value="free">Free Shipping</SelectItem>
                      <SelectItem value="fixed">Fixed Rate</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {form.watch("hasFlatRate") && <Separator className="my-4" />}

                <div className={cn("flex flex-col space-y-8")}>
                  {form.watch("hasFlatRate") && (
                    <>
                      <NumericFormField
                        form={form}
                        name="flatRateAmount"
                        label="Flat Rate Amount"
                        placeholder="e.g. 25"
                        prependSpan="$"
                        className="w-[350px]"
                      />

                      <div className="space-y-4">
                        <SingleCheckboxFormField
                          form={form}
                          name="hasFreeShipping"
                          label="Do you offer free shipping if an order threshold is reached?"
                        />

                        {form.watch("hasFreeShipping") && (
                          <NumericFormField
                            form={form}
                            name="minFreeShipping"
                            label="Free Shipping Threshold"
                            placeholder="e.g. 25"
                            prependSpan="$"
                            className="w-[350px]"
                            description="What is the minimum amount for a user to qualify for free shipping? Defaults to 0."
                          />
                        )}
                      </div>
                    </>
                  )}
                </div>
              </FormSection>

              <FormSection
                title="Pickup"
                description="Let customers pick up their orders in person."
                bodyClassName="space-y-4"
                hasError={highlightErrors}
              >
                <div
                  className={cn(
                    "grid grid-cols-1 gap-4",
                    form.watch("hasFreeShipping") && "grid-cols-2",
                  )}
                ></div>
                <div className={cn("flex flex-col space-y-4")}>
                  <SwitchFormField
                    form={form}
                    name="hasPickup"
                    label="Pickup from Base"
                    description="Do you offer pickup from the address above?"
                  />

                  {form.watch("hasPickup") && (
                    <TextareaFormField
                      form={form}
                      name="pickupInstructions"
                      label="Pickup Instructions"
                      description="These will be visible when a user checks out and chooses pickup."
                      placeholder="e.g. You will receive an email when your order is ready for pickup. Pickup is at 123 Store St, Anytown, USA. from 10am - 5pm."
                    />
                  )}
                </div>
              </FormSection>
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};
