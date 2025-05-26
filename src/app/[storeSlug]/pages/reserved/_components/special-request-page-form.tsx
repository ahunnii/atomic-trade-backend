"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";

import type { ReservedSitePages } from "@prisma/client";
import type { JsonValue } from "@prisma/client/runtime/library";
import { zodResolver } from "@hookform/resolvers/zod";

import type { LargeMarkdownFormFieldRef } from "~/components/input/large-markdown-form-field";
import type { ReservedPageFormData } from "~/lib/validators/reserved-page";
import { reservedPageValidator } from "~/lib/validators/reserved-page";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Form } from "~/components/ui/form";
import { LargeMarkdownFormField } from "~/components/input/large-markdown-form-field";
import { SwitchFormField } from "~/components/input/switch-form-field";
import { FormDiscardButton } from "~/components/shared/form-discard-button";
import { FormHeader } from "~/components/shared/form-header";
import { LoadButton } from "~/components/shared/load-button";

type Props = {
  initialData: ReservedSitePages | null;
  storeSlug: string;
  storeId: string;
};

export const SpecialRequestPageForm = ({
  initialData,
  storeSlug,
  storeId,
}: Props) => {
  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["reservedPage"],
    redirectPath: `/${storeSlug}/pages/reserved`,
  });

  const editorRef = useRef<LargeMarkdownFormFieldRef>(null);

  const updatePoliciesMutation =
    api.reservedPage.update.useMutation(defaultActions);

  const form = useForm<ReservedPageFormData>({
    resolver: zodResolver(reservedPageValidator),
    defaultValues: {
      specialOrderPage: initialData?.specialOrderPage ?? null,
      enableSpecialOrderPage: initialData?.enableSpecialOrderPage ?? false,
    },
  });

  const onSubmit = async (data: ReservedPageFormData) => {
    await editorRef.current?.save();

    updatePoliciesMutation.mutate({
      ...data,
      storeId,
      specialOrderPage: form.getValues("specialOrderPage") as JsonValue,
      enableSpecialOrderPage: form.getValues("enableSpecialOrderPage") ?? false,
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
          <FormHeader
            title={"Update Special Request Page"}
            link={`/${storeSlug}/pages/reserved`}
          >
            <FormDiscardButton
              isLoading={isLoading}
              redirectPath={`/${storeSlug}/pages/reserved`}
            />
            <LoadButton isLoading={isLoading} type="submit" size="sm">
              Save changes
            </LoadButton>
          </FormHeader>

          <section className="form-body grid w-full grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-9">
              <div className="border-border bg-background/50 w-full space-y-4 rounded-md border p-4">
                <LargeMarkdownFormField
                  form={form}
                  ref={editorRef}
                  contentFieldName="specialOrderPage"
                  className="col-span-full w-full"
                  label="Special Request Page Content"
                  description="The content of the special request page. This is the main content of the page. It is the text that will be displayed on the page."
                />
              </div>
            </div>
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-3">
              <div className="border-border bg-background/50 sticky top-20 w-full space-y-4 rounded-md border p-4">
                <SwitchFormField
                  form={form}
                  name="enableSpecialOrderPage"
                  description="Enable or disable the special request page."
                  label="Enable Special Request Page"
                />
              </div>
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};
