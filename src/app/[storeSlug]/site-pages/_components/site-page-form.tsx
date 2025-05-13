"use client";

import type { Tag } from "emblor";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { uniqueId } from "lodash";
import { useForm } from "react-hook-form";

import { toastService } from "@dreamwalker-studios/toasts";
import { zodResolver } from "@hookform/resolvers/zod";

import type { ImageFormFieldRef } from "~/components/input/image-form-field";
import type { LargeMarkdownFormFieldRef } from "~/components/input/large-markdown-form-field";
import type { BlogPostFormData } from "~/lib/validators/blog";
import type { SitePageFormData } from "~/lib/validators/site-page";
import type { SitePage } from "~/types/site-page";
import { env } from "~/env";
import { sitePageFormValidator } from "~/lib/validators/site-page";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Badge } from "~/components/ui/badge";
import { Form } from "~/components/ui/form";
import { ImageFormField } from "~/components/input/image-form-field";
import { InputFormField } from "~/components/input/input-form-field";
import { LargeMarkdownFormField } from "~/components/input/large-markdown-form-field";
import { SelectFormField } from "~/components/input/select-form-field";
import { TagFormField } from "~/components/input/tag-form-field";
import { FormAdditionalOptionsButton } from "~/components/shared/form-additional-options-button";
import { FormHeader } from "~/components/shared/form-header";
import { FormSaveOptionsButton } from "~/components/shared/form-save-options-button";
import { FormSection } from "~/components/shared/form-section";

type Props = {
  initialData: SitePage | null;
  sitePages: SitePage[];

  storeSlug: string;
  storeId: string;
};

export const SitePageForm = ({
  initialData,
  storeSlug,
  storeId,
  sitePages,
}: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["sitePage"],
    redirectPath: `/${storeSlug}/site-pages`,
  });

  const editorRef = useRef<LargeMarkdownFormFieldRef>(null);

  const title = initialData ? (
    initialData?.status === "PUBLISHED" ? (
      <div className="flex items-center gap-2">
        <span>Edit site page</span>
        <Badge
          variant="outline"
          className="bg-green-100 text-xs font-bold text-green-800 dark:bg-green-900 dark:text-green-100"
        >
          Published
        </Badge>
      </div>
    ) : (
      <span className="flex items-center gap-2">
        <span>Edit site page</span>
        <Badge variant="outline" className="text-xs">
          Draft
        </Badge>
      </span>
    )
  ) : (
    "Create site page"
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
          <FormHeader title={title} link={`/${storeSlug}/collections`}>
            {initialData && (
              <FormAdditionalOptionsButton
                onDelete={onDelete}
                onDuplicate={onSaveAndDuplicate}
              />
            )}

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

          <section className="form-body grid w-full grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-7">
              <FormSection
                title="Details"
                description="Basic information on the Collection"
                bodyClassName="space-y-4"
              >
                <InputFormField
                  form={form}
                  disabled={isLoading}
                  name="title"
                  label="Title"
                  placeholder="e.g. The Summer Collection"
                />

                <InputFormField
                  form={form}
                  disabled={isLoading}
                  name="slug"
                  label="Slug"
                  placeholder="e.g. the-summer-collection"
                  description="The slug is the URL of the page. It is used to identify the page and is used in the URL. It is also used to identify the page in the database. Make sure it is unique!"
                />

                <LargeMarkdownFormField
                  form={form}
                  ref={editorRef}
                  contentFieldName="content"
                  className="col-span-full w-full"
                />
              </FormSection>
            </div>
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-5">
              <div className="border-border bg-background/50 w-full rounded-md border p-4">
                <SelectFormField
                  form={form}
                  name="parentId"
                  label="(Optional) Parent Page"
                  description="Select a parent page for this page"
                  values={sitePages.map((page) => ({
                    label: page.title,
                    value: page.id,
                  }))}
                />
              </div>
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};
