"use client";

import type { Tag } from "emblor";
import { uniqueId } from "lodash";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import type { CustomerFormData } from "~/lib/validators/customer";
import type { Address } from "~/lib/validators/geocoding";
import type { Customer } from "~/types/customer";
import { customerValidator } from "~/lib/validators/customer";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Form } from "~/components/ui/form";
import { AutoCompleteAddressFormField } from "~/components/input/autocomplete-address-form-field";
import { InputFormField } from "~/components/input/input-form-field";
import { PhoneFormField } from "~/components/input/phone-form-field";
import { TagFormField } from "~/components/input/tag-form-field";
import { TextareaFormField } from "~/components/input/textarea-form-field";
import { FormAdditionalOptionsButton } from "~/components/shared/form-additional-options-button";
import { FormHeader } from "~/components/shared/form-header";
import { FormSection } from "~/components/shared/form-section";
import { LoadButton } from "~/components/shared/load-button";

type Props = {
  initialData: Customer | null;
  storeSlug: string;
  storeId: string;
  defaultAddress: Address | null;
};

export const CustomerForm = ({
  initialData,
  storeSlug,
  storeId,
  defaultAddress,
}: Props) => {
  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["customer"],
    redirectPath: `/${storeSlug}/customers`,
  });

  const title = initialData ? "Edit customer" : "Create customer";

  const updateCustomer = api.customer.update.useMutation(defaultActions);
  const createCustomer = api.customer.create.useMutation(defaultActions);
  const deleteCustomer = api.customer.delete.useMutation(defaultActions);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerValidator),
    defaultValues: {
      address: {
        id: defaultAddress?.id ?? "temp",
        formatted: defaultAddress?.formatted ?? "",
        firstName: defaultAddress?.firstName ?? "",
        lastName: defaultAddress?.lastName ?? "",
        street: defaultAddress?.street ?? "",
        additional: defaultAddress?.additional ?? "",
        city: defaultAddress?.city ?? "",
        state: defaultAddress?.state ?? "",
        postalCode: defaultAddress?.postalCode ?? "",
        country: defaultAddress?.country ?? "",
      },
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      firstName: initialData?.firstName ?? "",
      lastName: initialData?.lastName ?? "",
      tags:
        initialData?.tags && initialData?.tags.length > 0
          ? (initialData?.tags?.map((tag) => ({
              text: tag,
              id: uniqueId(),
            })) as Tag[])
          : [],
      notes: initialData?.notes ?? "",
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    void onSave(data);
  };

  const onSave = async (data: CustomerFormData) => {
    if (initialData)
      updateCustomer.mutate({ ...data, customerId: initialData.id });
    else createCustomer.mutate({ ...data, storeId });
  };

  const onDelete = () => deleteCustomer.mutate(initialData?.id ?? "");

  const isLoading =
    updateCustomer.isPending ||
    createCustomer.isPending ||
    deleteCustomer.isPending;

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <FormHeader title={title} link={`/${storeSlug}/customers`}>
            {initialData && <FormAdditionalOptionsButton onDelete={onDelete} />}

            <LoadButton isLoading={isLoading} type="submit">
              Save
            </LoadButton>
          </FormHeader>

          <section className="form-body grid w-full grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-7">
              <FormSection
                title="Customer Details"
                description="Basic information on the customer"
                bodyClassName="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputFormField
                    form={form}
                    disabled={isLoading}
                    name="firstName"
                    label="First Name"
                    placeholder="e.g. John"
                    className="col-span-1"
                  />

                  <InputFormField
                    form={form}
                    disabled={isLoading}
                    name="lastName"
                    label="Last Name"
                    placeholder="e.g. Doe"
                    className="col-span-1"
                  />
                </div>
                <InputFormField
                  form={form}
                  name="email"
                  label="Email"
                  placeholder="e.g business@email.com"
                />
                <PhoneFormField
                  form={form}
                  name="phone"
                  label="Phone (Optional)"
                  placeholder="e.g (123) 456-7890"
                  description="Note that you should ask permission before sending SMS messages / calling customers."
                />
              </FormSection>
              <FormSection
                title="Address"
                description="This is the default address for the customer. Note that customers can have multiple addresses."
                bodyClassName="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputFormField
                    form={form}
                    disabled={isLoading}
                    name="address.firstName"
                    label="First Name"
                    placeholder="e.g. John"
                    className="col-span-1"
                  />

                  <InputFormField
                    form={form}
                    disabled={isLoading}
                    name="address.lastName"
                    label="Last Name"
                    placeholder="e.g. Doe"
                    className="col-span-1"
                  />
                </div>
                <AutoCompleteAddressFormField
                  form={form}
                  name="address.formatted"
                  label="Address"
                  defaultValue={{
                    id: form.getValues("address.id"),
                    formatted: form.getValues("address.formatted") ?? "",
                    street: form.getValues("address.street") ?? "",
                    additional: form.getValues("address.additional") ?? "",
                    city: form.getValues("address.city") ?? "",
                    state: form.getValues("address.state") ?? "",
                    postalCode: form.getValues("address.postalCode") ?? "",
                    country: form.getValues("address.country") ?? "",
                  }}
                  onSelectAdditional={(address) => {
                    form.setValue("address", {
                      id: address.id,
                      formatted: address.formatted,
                      street: address.street,
                      additional: address.additional,
                      city: address.city,
                      state: address.state,
                      postalCode: address.postalCode,
                      country: address.country,
                    });
                  }}
                />
              </FormSection>
              <FormSection
                title="Miscellaneous"
                description="Miscellaneous information on the customer"
                bodyClassName="space-y-4"
              >
                <TextareaFormField
                  form={form}
                  disabled={isLoading}
                  name="notes"
                  label="Notes (optional)"
                  placeholder="e.g. Summer is here! Get your summer essentials now!"
                />
                <TagFormField
                  form={form}
                  defaultTags={form.getValues("tags") ?? []}
                  name="tags"
                  label="Tags (optional)"
                  description="Tags are used to categorize your customers. You can add multiple tags to a customer."
                />
              </FormSection>
            </div>
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-5"></div>
          </section>
        </form>
      </Form>
    </>
  );
};
