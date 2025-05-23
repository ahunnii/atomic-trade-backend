"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";

import type { SitePolicies } from "@prisma/client";
import type { JsonValue } from "@prisma/client/runtime/library";
import { zodResolver } from "@hookform/resolvers/zod";

import type { LargeMarkdownFormFieldRef } from "~/components/input/large-markdown-form-field";
import type { PoliciesFormData } from "~/lib/validators/policy";
import { policiesValidator } from "~/lib/validators/policy";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Form } from "~/components/ui/form";
import { LargeMarkdownFormField } from "~/components/input/large-markdown-form-field";
import { FormDiscardButton } from "~/components/shared/form-discard-button";
import { FormHeader } from "~/components/shared/form-header";
import { FormSection } from "~/components/shared/form-section";
import { LoadButton } from "~/components/shared/load-button";

type Props = {
  initialData: SitePolicies | null;
  storeSlug: string;
  storeId: string;
};

export const ShippingPolicyForm = ({
  initialData,
  storeSlug,
  storeId,
}: Props) => {
  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["policy"],
    redirectPath: `/${storeSlug}/settings/policies`,
  });

  const editorRef2 = useRef<LargeMarkdownFormFieldRef>(null);

  const title = "Update Shipping Policy";

  const updatePoliciesMutation = api.policy.update.useMutation(defaultActions);

  const form = useForm<PoliciesFormData>({
    resolver: zodResolver(policiesValidator),
    defaultValues: {
      shippingPolicy: initialData?.shippingPolicy ?? null,
    },
  });

  const onSubmit = async (data: PoliciesFormData) => {
    await editorRef2.current?.save();

    updatePoliciesMutation.mutate({
      ...data,
      storeId,
      shippingPolicy: form.getValues("shippingPolicy") as JsonValue,
    });
  };

  const isLoading = updatePoliciesMutation.isPending;

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <FormHeader title={title} link={`/${storeSlug}/settings/policies`}>
            <FormDiscardButton
              isLoading={isLoading}
              redirectPath={`/${storeSlug}/settings/policies`}
            />
            <LoadButton isLoading={isLoading} type="submit">
              Save changes
            </LoadButton>
          </FormHeader>

          <section className="form-body grid w-full grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-7">
              <FormSection
                title="Shipping Policy"
                description="Basic information on the Shipping Policy"
                bodyClassName="space-y-4"
              >
                <LargeMarkdownFormField
                  form={form}
                  ref={editorRef2}
                  contentFieldName="shippingPolicy"
                  // label="Shipping Policy"
                  className="col-span-full w-full"
                />
              </FormSection>
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};
