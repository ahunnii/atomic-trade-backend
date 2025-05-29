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

export const FrequentlyAskedQuestionsPageForm = ({
  initialData,
  storeSlug,
  storeId,
}: Props) => {
  const parentPath = `/${storeSlug}/pages/reserved`;

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["reservedPage"],
    redirectPath: parentPath,
  });

  const editorRef = useRef<LargeMarkdownFormFieldRef>(null);

  const updatePoliciesMutation =
    api.reservedPage.update.useMutation(defaultActions);

  const form = useForm<ReservedPageFormData>({
    resolver: zodResolver(reservedPageValidator),
    defaultValues: {
      faqPage: initialData?.faqPage ?? null,
      enableFaqPage: initialData?.enableFaqPage ?? false,
    },
  });

  const onSubmit = async (data: ReservedPageFormData) => {
    await editorRef.current?.save();

    updatePoliciesMutation.mutate({
      ...data,
      storeId,
      faqPage: form.getValues("faqPage") as JsonValue,
      enableFaqPage: form.getValues("enableFaqPage") ?? false,
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
            title={"Update Frequently Asked Questions Page"}
            link={parentPath}
          >
            <FormDiscardButton
              isLoading={isLoading}
              redirectPath={parentPath}
            />
            <LoadButton isLoading={isLoading} type="submit" size="sm">
              Save changes
            </LoadButton>
          </FormHeader>

          <section className="form-body">
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-9">
              <div className="form-card">
                <LargeMarkdownFormField
                  form={form}
                  ref={editorRef}
                  contentFieldName="faqPage"
                  label="Frequently Asked Questions Page Content"
                  description="The content of the frequently asked questions page. This is the main content of the page. It is the text that will be displayed on the page."
                  className="col-span-full w-full"
                />
              </div>
            </div>
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-3">
              <div className="form-card sticky top-20">
                <SwitchFormField
                  form={form}
                  name="enableFaqPage"
                  description="Enable or disable the faq page."
                  label="Enable Faq Page"
                />
              </div>
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};
