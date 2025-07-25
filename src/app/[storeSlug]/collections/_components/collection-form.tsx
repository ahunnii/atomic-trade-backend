"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { toastService } from "@dreamwalker-studios/toasts";
import { zodResolver } from "@hookform/resolvers/zod";

import type { ImageFormFieldRef } from "~/components/input/image-form-field";
import type { CollectionFormData } from "~/lib/validators/collection";
import type { CollectionWithProducts } from "~/types/collection";
import type { ProductWithVariations } from "~/types/product";
import { env } from "~/env";
import { collectionFormValidator } from "~/lib/validators/collection";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Form } from "~/components/ui/form";
import { ImageFormField } from "~/components/input/image-form-field";
import { InputFormField } from "~/components/input/input-form-field";
import { SingleCheckboxFormField } from "~/components/input/single-checkbox-form-field";
import { TextareaFormField } from "~/components/input/textarea-form-field";
import { FormAdditionalOptionsButton } from "~/components/shared/form-additional-options-button";
import { FormDiscardButton } from "~/components/shared/form-discard-button";
import { FormHeader } from "~/components/shared/form-header";
import { FormSaveOptionsButton } from "~/components/shared/form-save-options-button";
import { FormSection } from "~/components/shared/form-section";
import { FormStatusTitle } from "~/components/shared/form-status-title";

import { ProductSelection } from "./product-selection";

type Props = {
  initialData: CollectionWithProducts | null;
  products: ProductWithVariations[];
  storeSlug: string;
  storeId: string;
};

export const CollectionForm = ({
  initialData,
  products,
  storeSlug,
  storeId,
}: Props) => {
  const router = useRouter();

  const parentPath = `/${storeSlug}/collections`;

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["collection"],
    redirectPath: parentPath,
  });

  const title = (
    <FormStatusTitle
      hasInitialData={!!initialData}
      title="Collection"
      status={initialData?.status ?? "DRAFT"}
    />
  );

  const updateCollection = api.collection.update.useMutation(defaultActions);
  const createCollection = api.collection.create.useMutation(defaultActions);
  const deleteCollection = api.collection.delete.useMutation(defaultActions);

  const updateForDuplication = api.collection.update.useMutation({
    ...defaultActions,
    onSuccess: ({ message }) => {
      defaultActions.onSuccess({ message, cancelRedirect: true });
    },
  });

  const duplicateCollection = api.collection.duplicate.useMutation({
    ...defaultActions,
    onSuccess: ({ data, message }) => {
      defaultActions.onSuccess({ message, cancelRedirect: true });
      void router.push(`${parentPath}/${data.id}/edit`);
    },
  });

  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionFormValidator),
    defaultValues: {
      name: initialData?.name ?? "",
      imageUrl: initialData?.imageUrl ?? undefined,
      tempImageUrl: undefined,
      description: initialData?.description ?? "",
      products: initialData?.products ?? [],
      isFeatured: initialData?.isFeatured ?? false,
      status: initialData?.status ?? "DRAFT",
    },
  });

  const featuredImageRef = useRef<ImageFormFieldRef>(null);

  const onSave = async (data: CollectionFormData, publish?: boolean) => {
    const featuredImage = await featuredImageRef.current?.upload();

    if (
      (initialData && !featuredImage && !initialData?.imageUrl) ||
      (!initialData && !featuredImage)
    ) {
      toastService.error("Please upload a featured image");
      return;
    }

    if (initialData) {
      updateCollection.mutate({
        ...data,
        collectionId: initialData.id,
        status: publish ? "ACTIVE" : "DRAFT",
        imageUrl: featuredImage ?? initialData.imageUrl,
      });
    } else {
      createCollection.mutate({
        ...data,
        storeId,
        status: publish ? "ACTIVE" : "DRAFT",
        imageUrl: featuredImage!,
      });
    }
  };

  const onSubmit = (data: CollectionFormData) => {
    void onSave(data, data?.status === "ACTIVE");
  };

  const onDelete = () => deleteCollection.mutate(initialData?.id ?? "");

  const onSaveAndDuplicate = async () => {
    const data = form.getValues();

    if (!initialData) {
      toastService.error("Please create a collection first");
      return;
    }

    const featuredImage = await featuredImageRef.current?.upload();

    const savedCollection = await updateForDuplication.mutateAsync({
      ...data,
      collectionId: initialData.id,
      imageUrl: featuredImage ?? initialData.imageUrl,
    });
    await duplicateCollection.mutateAsync(savedCollection.data.id);
  };

  const currentFeaturedImage = form.formState?.defaultValues?.imageUrl
    ? `${env.NEXT_PUBLIC_STORAGE_URL}/misc/${form.formState?.defaultValues?.imageUrl}`
    : undefined;

  const isLoading =
    updateCollection.isPending ||
    createCollection.isPending ||
    deleteCollection.isPending ||
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
              onSave={() => onSave(form.getValues(), false)}
              onPublish={() => onSave(form.getValues(), true)}
              isLoading={isLoading}
            />
          </FormHeader>

          <section className="form-body">
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-7">
              <FormSection
                title="Details"
                description="Basic information on the Collection"
                bodyClassName="space-y-4"
              >
                <InputFormField
                  form={form}
                  disabled={isLoading}
                  name="name"
                  label="Name"
                  placeholder="e.g. The Summer Collection"
                />

                <TextareaFormField
                  form={form}
                  disabled={isLoading}
                  name="description"
                  label="Description (optional)"
                  placeholder="e.g. Summer is here! Get your summer essentials now!"
                />
              </FormSection>
              <FormSection
                title="Products"
                description="Add products to the collection"
              >
                <ProductSelection
                  form={form}
                  isLoading={isLoading}
                  products={products ?? []}
                  storeSlug={storeSlug}
                />
              </FormSection>
            </div>
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-5">
              <SingleCheckboxFormField
                form={form}
                name="isFeatured"
                label="Featured"
                description="This collection will be given more of a spotlight on the homepage, and throughout the site."
              />

              <div className="form-card">
                <ImageFormField
                  form={form}
                  ref={featuredImageRef}
                  label="Thumbnail (optional)"
                  disabled={isLoading}
                  isRequired={false}
                  route="misc"
                  apiUrl="/api/upload-misc"
                  name="imageUrl"
                  tempName="tempImageUrl"
                  currentImageUrl={currentFeaturedImage}
                  description="Shown on the collection page to represent the collection"
                />
              </div>
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};
