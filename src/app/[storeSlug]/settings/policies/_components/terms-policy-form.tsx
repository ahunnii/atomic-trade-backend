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

export const TermsPolicyForm = ({ initialData, storeSlug, storeId }: Props) => {
  const parentPath = `/${storeSlug}/settings/policies`;

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["policy"],
    redirectPath: parentPath,
  });

  const editorRef3 = useRef<LargeMarkdownFormFieldRef>(null);

  const title = "Update Terms of Service";

  const updatePoliciesMutation = api.policy.update.useMutation(defaultActions);

  const form = useForm<PoliciesFormData>({
    resolver: zodResolver(policiesValidator),
    defaultValues: {
      privacyPolicy: initialData?.privacyPolicy ?? null,
      shippingPolicy: initialData?.shippingPolicy ?? null,
      termsOfService: initialData?.termsOfService ?? null,
      refundPolicy: initialData?.refundPolicy ?? null,
    },
  });

  const onSubmit = async (data: PoliciesFormData) => {
    await editorRef3.current?.save();

    updatePoliciesMutation.mutate({
      ...data,
      storeId,

      termsOfService: form.getValues("termsOfService") as JsonValue,
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
          <FormHeader title={title} link={parentPath}>
            <FormDiscardButton
              isLoading={isLoading}
              redirectPath={parentPath}
            />
            <LoadButton isLoading={isLoading} type="submit">
              Save changes
            </LoadButton>
          </FormHeader>

          <section className="form-body">
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-7">
              <FormSection
                title="Terms of Service"
                description="Basic information on the Terms of Service"
                bodyClassName="space-y-4"
              >
                <LargeMarkdownFormField
                  form={form}
                  ref={editorRef3}
                  contentFieldName="termsOfService"
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
