"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import type { AttributeFormData } from "~/lib/validators/attribute";
import type { Attribute } from "~/types/attribute";
import { cn } from "~/lib/utils";
import { attributeValidator } from "~/lib/validators/attribute";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Form } from "~/components/ui/form";
import { InputFormField } from "~/components/input/input-form-field";
import { FormAdditionalOptionsButton } from "~/components/shared/form-additional-options-button";
import { FormDiscardButton } from "~/components/shared/form-discard-button";
import { FormSection } from "~/components/shared/form-section";
import { LoadButton } from "~/components/shared/load-button";

import { FormHeader } from "../../../../components/shared/form-header";
import { AttributesNestedValueInput } from "./attributes-nested-value-input";

type Props = {
  initialData: Attribute | null;
  storeId: string;
  storeSlug: string;
};

export const AttributeForm = ({ initialData, storeId, storeSlug }: Props) => {
  const params = useParams();
  const router = useRouter();
  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["attribute"],
    redirectPath: `/${storeSlug}/attributes`,
  });

  const attributeId = params.attributeId as string;

  const title = initialData ? "Edit attribute" : "Create attribute";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<AttributeFormData>({
    resolver: zodResolver(attributeValidator),
    defaultValues: {
      name: initialData?.name ?? "",
      values: initialData?.values.map((val) => ({ content: val })) ?? [
        { content: "" },
      ],
    },
  });
  const formErrors = form.formState.errors;

  const updateAttribute = api.attribute.update.useMutation(defaultActions);
  const createAttribute = api.attribute.create.useMutation(defaultActions);
  const deleteAttribute = api.attribute.delete.useMutation(defaultActions);

  const onSubmit = (data: AttributeFormData) => {
    if (initialData) updateAttribute.mutate({ ...data, attributeId });
    else createAttribute.mutate({ ...data, storeId, productId: "" });
  };

  const onDelete = () => deleteAttribute.mutate(attributeId);

  const onSaveAndDuplicate = async () => {
    await updateAttribute.mutateAsync({ ...form.watch(), attributeId });
  };

  const isLoading =
    updateAttribute.isPending ||
    createAttribute.isPending ||
    deleteAttribute.isPending;

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <FormHeader title={title} link={`/${storeSlug}/attributes`}>
            {initialData && (
              <FormAdditionalOptionsButton
                onDelete={onDelete}
                onDuplicate={onSaveAndDuplicate}
              />
            )}

            <FormDiscardButton isLoading={isLoading} />
            <LoadButton type="submit" isLoading={isLoading}>
              {action}
            </LoadButton>
          </FormHeader>

          <section className="form-body">
            <div className={cn("flex w-full flex-col space-y-4")}>
              <FormSection
                title="Details"
                description="Assign basic info about the attribute"
                headerClassName="xl:w-4/12"
                bodyClassName="space-y-8 xl:w-8/12 mt-0"
                className="flex flex-col justify-between gap-8 xl:flex-row"
              >
                <InputFormField
                  form={form}
                  name="name"
                  label="Name"
                  disabled={isLoading}
                  placeholder="e.g. Size"
                  description="Tip: This represents a type of product, so make sure it
                  has a name that fits"
                />
              </FormSection>
              <FormSection
                title="Values"
                description=" Add Attribute values to quickly make variants of your products. I.E. sizes, colors, materials, etc."
                headerClassName="xl:w-4/12"
                bodyClassName="space-y-8 xl:w-8/12 mt-0"
                className="flex flex-col justify-between gap-8 xl:flex-row"
              >
                <div
                  className={cn(
                    "border-border flex w-full flex-col items-start space-y-4 rounded-md border p-4 shadow",
                    formErrors?.values && "border-red-600",
                  )}
                  tabIndex={0}
                >
                  <AttributesNestedValueInput
                    {...{ control: form.control, form: form }}
                  />
                </div>
              </FormSection>
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};
