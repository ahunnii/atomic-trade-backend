"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import type { SitePage } from "@prisma/client";
import { toastService } from "@dreamwalker-studios/toasts";
import { zodResolver } from "@hookform/resolvers/zod";

import type { LargeMarkdownFormFieldRef } from "~/components/input/large-markdown-form-field";
import type { SitePageFormData } from "~/lib/validators/site-page";
import { sitePageFormValidator } from "~/lib/validators/site-page";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Form } from "~/components/ui/form";
import { InputFormField } from "~/components/input/input-form-field";
import { LargeMarkdownFormField } from "~/components/input/large-markdown-form-field";
import { FormAdditionalOptionsButton } from "~/components/shared/form-additional-options-button";
import { FormDiscardButton } from "~/components/shared/form-discard-button";
import { FormHeader } from "~/components/shared/form-header";
import { FormSaveOptionsButton } from "~/components/shared/form-save-options-button";
import { FormStatusTitle } from "~/components/shared/form-status-title";

type Props = {
  initialData: SitePage | null;
  sitePages: SitePage[];
  storeSlug: string;
  storeId: string;
};

export const SitePageForm = ({ initialData, storeSlug, storeId }: Props) => {
  const router = useRouter();

  const parentPath = `/${storeSlug}/pages/site`;

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["sitePage"],
    redirectPath: parentPath,
  });

  const editorRef = useRef<LargeMarkdownFormFieldRef>(null);

  const title = (
    <FormStatusTitle
      hasInitialData={!!initialData}
      title="Site Page"
      status={initialData?.status ?? "DRAFT"}
    />
  );

  const updateSitePage = api.sitePage.update.useMutation(defaultActions);
  const createSitePage = api.sitePage.create.useMutation(defaultActions);
  const deleteSitePage = api.sitePage.delete.useMutation(defaultActions);

  const updateForDuplication = api.sitePage.update.useMutation({
    ...defaultActions,
    onSuccess: ({ message }) => {
      defaultActions.onSuccess({ message, cancelRedirect: true });
    },
  });

  const duplicateSitePage = api.sitePage.duplicate.useMutation({
    ...defaultActions,
    onSuccess: ({ data, message }) => {
      defaultActions.onSuccess({ message, cancelRedirect: true });
      void router.push(`/${storeSlug}/site-pages/${data.id}/edit`);
    },
  });

  const form = useForm<SitePageFormData>({
    resolver: zodResolver(sitePageFormValidator),
    defaultValues: {
      title: initialData?.title ?? "",
      content: initialData?.content ?? "",
      status: initialData?.status ?? "DRAFT",
      slug: initialData?.slug ?? "",
      parentId: initialData?.parentId ?? undefined,
      parentSlug: initialData?.parentSlug ?? undefined,
    },
  });

  const onSubmit = (data: SitePageFormData) => {
    console.log(data);
  };

  const onSave = async (data: SitePageFormData, publish = false) => {
    if (initialData) {
      updateSitePage.mutate({
        ...data,
        sitePageId: initialData.id,
        status: publish ? "PUBLISHED" : "DRAFT",
      });
    } else {
      createSitePage.mutate({
        ...data,
        storeId,
        status: publish ? "PUBLISHED" : "DRAFT",
      });
    }
  };

  const onDelete = () => deleteSitePage.mutate(initialData?.id ?? "");

  const onSaveAndDuplicate = async () => {
    const data = form.getValues();

    if (!initialData) {
      toastService.error("Please create a site page first");
      return;
    }

    const savedBlogPost = await updateForDuplication.mutateAsync({
      ...data,
      sitePageId: initialData.id,
    });
    await duplicateSitePage.mutateAsync(savedBlogPost.data.id);
  };

  const isLoading =
    updateSitePage.isPending ||
    createSitePage.isPending ||
    deleteSitePage.isPending;

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
              onSave={async () => {
                await editorRef.current?.save();
                void onSave(form.getValues(), false);
              }}
              onPublish={async () => {
                await editorRef.current?.save();
                void onSave(form.getValues(), true);
              }}
              isLoading={isLoading}
            />
          </FormHeader>

          <section className="form-body">
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-9">
              <div className="form-card">
                <LargeMarkdownFormField
                  form={form}
                  ref={editorRef}
                  contentFieldName="content"
                  className="col-span-full w-full"
                  label="Content"
                  description="The content of the page. This is the main content of the page. It is the text that will be displayed on the page."
                />
              </div>
            </div>
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-3">
              <div className="form-card sticky top-20">
                <InputFormField
                  form={form}
                  disabled={isLoading}
                  name="title"
                  label="Title"
                  placeholder="e.g. Meet the Team"
                />

                <InputFormField
                  form={form}
                  disabled={isLoading}
                  name="slug"
                  label="Slug"
                  placeholder="e.g. meet-the-team"
                  description="The slug is the URL of the page. It is used to identify the page and is used in the URL. It is also used to identify the page in the database. Make sure it is unique!"
                />
              </div>
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};
