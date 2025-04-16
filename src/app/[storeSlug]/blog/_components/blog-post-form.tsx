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
import type { BlogPost } from "~/types/blog";
import { env } from "~/env";
import { blogPostFormValidator } from "~/lib/validators/blog";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Badge } from "~/components/ui/badge";
import { Form } from "~/components/ui/form";
import { ImageFormField } from "~/components/input/image-form-field";
import { InputFormField } from "~/components/input/input-form-field";
import { LargeMarkdownFormField } from "~/components/input/large-markdown-form-field";
import { TagFormField } from "~/components/input/tag-form-field";
import { FormAdditionalOptionsButton } from "~/components/shared/form-additional-options-button";
import { FormHeader } from "~/components/shared/form-header";
import { FormSaveOptionsButton } from "~/components/shared/form-save-options-button";
import { FormSection } from "~/components/shared/form-section";

type Props = {
  initialData: BlogPost | null;

  storeSlug: string;
  storeId: string;
};

export const BlogPostForm = ({ initialData, storeSlug, storeId }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["blog"],
    redirectPath: `/${storeSlug}/blog`,
  });

  const editorRef = useRef<LargeMarkdownFormFieldRef>(null);

  const title = initialData ? (
    initialData?.status === "PUBLISHED" ? (
      <div className="flex items-center gap-2">
        <span>Edit blog post</span>
        <Badge
          variant="outline"
          className="bg-green-100 text-xs font-bold text-green-800 dark:bg-green-900 dark:text-green-100"
        >
          Published
        </Badge>
      </div>
    ) : (
      <span className="flex items-center gap-2">
        <span>Edit blog post</span>
        <Badge variant="outline" className="text-xs">
          Draft
        </Badge>
      </span>
    )
  ) : (
    "Create blog post"
  );

  const updateBlogPost = api.blog.update.useMutation(defaultActions);
  const createBlogPost = api.blog.create.useMutation(defaultActions);
  const deleteBlogPost = api.blog.delete.useMutation(defaultActions);

  const updateForDuplication = api.blog.update.useMutation({
    ...defaultActions,
    onSuccess: ({ message }) => {
      defaultActions.onSuccess({ message, cancelRedirect: true });
    },
  });

  const duplicateBlogPost = api.blog.duplicate.useMutation({
    ...defaultActions,
    onSuccess: ({ data, message }) => {
      defaultActions.onSuccess({ message, cancelRedirect: true });
      void router.push(`/${storeSlug}/blog/${data.id}/edit`);
    },
  });

  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostFormValidator),
    defaultValues: {
      title: initialData?.title ?? "",
      content: initialData?.content ?? "",
      tempCover: undefined,
      tags:
        initialData?.tags && initialData?.tags.length > 0
          ? (initialData?.tags?.map((tag) => ({
              text: tag,
              id: uniqueId(),
            })) as Tag[])
          : [],
      cover: initialData?.cover ?? undefined,
      status: initialData?.status ?? "DRAFT",
    },
  });

  const onSubmit = (data: BlogPostFormData) => {
    console.log(data);
  };

  const featuredImageRef = useRef<ImageFormFieldRef>(null);

  const onSave = async (data: BlogPostFormData, publish = false) => {
    const featuredImage = await featuredImageRef.current?.upload();

    if (initialData) {
      updateBlogPost.mutate({
        ...data,
        blogPostId: initialData.id,
        status: publish ? "PUBLISHED" : "DRAFT",
        cover: featuredImage ?? initialData.cover ?? undefined,
        tags: data.tags.map((tag) => tag.text),
      });
    } else {
      createBlogPost.mutate({
        ...data,
        storeId,
        status: publish ? "PUBLISHED" : "DRAFT",
        cover: featuredImage ?? undefined,
        tags: data.tags.map((tag) => tag.text),
      });
    }
  };

  const onDelete = () => deleteBlogPost.mutate(initialData?.id ?? "");

  const onSaveAndDuplicate = async () => {
    const data = form.getValues();

    if (!initialData) {
      toastService.error("Please create a blog post first");
      return;
    }

    const featuredImage = await featuredImageRef.current?.upload();

    const savedBlogPost = await updateForDuplication.mutateAsync({
      ...data,
      blogPostId: initialData.id,
      cover: featuredImage ?? initialData.cover ?? undefined,
      tags: data.tags.map((tag) => tag.text),
    });
    await duplicateBlogPost.mutateAsync(savedBlogPost.data.id);
  };

  const currentFeaturedImage = form.formState?.defaultValues?.cover
    ? `${env.NEXT_PUBLIC_STORAGE_URL}/misc/${form.formState?.defaultValues?.cover}`
    : undefined;

  const isLoading =
    updateBlogPost.isPending ||
    createBlogPost.isPending ||
    deleteBlogPost.isPending ||
    (featuredImageRef.current?.isUploading ?? false);

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
                <ImageFormField
                  form={form}
                  ref={featuredImageRef}
                  label="Cover Image (optional)"
                  disabled={isLoading}
                  isRequired={true}
                  route="misc"
                  apiUrl="/api/upload-misc"
                  name="cover"
                  tempName="tempCover"
                  currentImageUrl={currentFeaturedImage}
                  description="Used to represent your blog on social media and other places."
                />
              </div>
              <div className="border-border bg-background/50 w-full rounded-md border p-4">
                <TagFormField
                  form={form}
                  label="Tags (optional)"
                  defaultTags={form.getValues("tags") ?? []}
                  name="tags"
                  description="Tags are used to categorize your blog posts. You can add multiple tags to a blog post."
                />
              </div>
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};
