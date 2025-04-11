"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Terminal } from "lucide-react";
import { useForm } from "react-hook-form";

import { toastService } from "@dreamwalker-studios/toasts";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { ProductStatus } from "@prisma/client";

import type { ImageFormFieldRef } from "~/components/input/image-form-field";
import type { MultiImageFormFieldRef } from "~/components/input/multi-image-form-field";
import type { ProductFormData } from "~/lib/validators/product";
import type { Product } from "~/types/product";
import { env } from "~/env";
import { productFormValidator } from "~/lib/validators/product";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Form } from "~/components/ui/form";
import { ImageFormField } from "~/components/input/image-form-field";
import { MultiImageFormField } from "~/components/input/multi-image-form-field";
import { SingleCheckboxFormField } from "~/components/input/single-checkbox-form-field";
import { FormAdditionalOptionsButton } from "~/components/shared/form-additional-options-button";
import { FormHeader } from "~/components/shared/form-header";
import { FormSaveOptionsButton } from "~/components/shared/form-save-options-button";
import { FormSection } from "~/components/shared/form-section";

import { ProductInventorySection } from "./inventory-section";
import { ProductDetailsSection } from "./product-details-section";

type Props = {
  initialData: (Product & { _count: { variants: number | null } }) | null;
  productId?: string;
  storeId: string;
  storeSlug: string;
};

export const ProductForm = ({ initialData, storeId, storeSlug }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["product"],
    redirectPath: `/${storeSlug}/products`,
  });

  const title = initialData ? (
    initialData?.status === "ACTIVE" ? (
      <div className="flex items-center gap-2">
        <span>Edit product</span>
        <Badge
          variant="outline"
          className="bg-green-100 text-xs font-bold text-green-800 dark:bg-green-900 dark:text-green-100"
        >
          Active
        </Badge>
      </div>
    ) : (
      <span className="flex items-center gap-2">
        <span>Edit product</span>
        <Badge variant="outline" className="text-xs">
          Draft
        </Badge>
      </span>
    )
  ) : (
    "Create product"
  );

  const updateProduct = api.product.update.useMutation(defaultActions);
  const createProduct = api.product.create.useMutation(defaultActions);
  const deleteProduct = api.product.delete.useMutation(defaultActions);

  const updateForDuplication = api.product.update.useMutation({
    ...defaultActions,
    onSuccess: ({ message }) => {
      defaultActions.onSuccess({ message, cancelRedirect: true });
    },
  });

  const duplicateProduct = api.product.duplicate.useMutation({
    ...defaultActions,
    onSuccess: ({ data, message }) => {
      defaultActions.onSuccess({ message, cancelRedirect: true });
      void router.push(`/${storeSlug}/products/${data.id}/edit`);
    },
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormValidator),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      isFeatured: initialData?.isFeatured ?? false,
      status: initialData?.status ?? ProductStatus.DRAFT,
      attributes:
        initialData?.attributes.map((attribute) => ({
          id: attribute.id ?? createId(),
          name: attribute.name,
          values: attribute.values,
        })) ?? [],
      additionalInfo: initialData?.additionalInfo ?? null,
      variants:
        initialData?.variants && initialData?.variants.length > 0
          ? initialData?.variants.map((variant) => ({
              ...variant,
              imageUrl: "",
              sku: "",
            }))
          : [
              {
                values: [],
                priceInCents: 150,
                name: "Default",
                stock: 0,
                imageUrl: "",
                sku: "",
                id: createId(),
                manageStock: false,
              },
            ],

      tempImages: [],
      images: initialData?.images ?? [],
      tempFeaturedImage: null,
      featuredImage: initialData?.featuredImage ?? "",
    },
  });

  const onSave = async (data: ProductFormData, publish = false) => {
    const featuredImage = await featuredImageRef.current?.upload();
    const images = await mediaRef.current?.upload();

    if (
      (initialData && !featuredImage && !initialData?.featuredImage) ||
      (!initialData && !featuredImage)
    ) {
      toastService.error("Please upload a featured image");
      return;
    }

    if (initialData) {
      updateProduct.mutate({
        ...data,
        productId: initialData.id,
        status: publish ? "ACTIVE" : "DRAFT",
        featuredImage: featuredImage ?? initialData.featuredImage,
        images: images ?? initialData.images,
      });
    } else {
      createProduct.mutate({
        ...data,
        storeId,
        status: publish ? "ACTIVE" : "DRAFT",
        featuredImage: featuredImage!,
        images: images ?? [],
      });
    }
  };

  const onSaveAndDuplicate = async () => {
    const data = form.getValues();

    if (!initialData) {
      toastService.error("Please create a product first");
      return;
    }

    const featuredImage = await featuredImageRef.current?.upload();
    const images = await mediaRef.current?.upload();

    if (initialData && !featuredImage && !initialData?.featuredImage) {
      toastService.error("Please upload a featured image");
      return;
    }

    const savedProduct = await updateForDuplication.mutateAsync({
      ...data,
      productId: initialData.id,
      featuredImage: featuredImage ?? initialData.featuredImage,
      images: images ?? initialData.images,
    });
    await duplicateProduct.mutateAsync(savedProduct.data.id);
  };

  const onSubmit = async (data: ProductFormData) => {
    await onSave(data, false);
  };

  const onDelete = () =>
    initialData ? deleteProduct.mutate(initialData.id) : undefined;

  const wasProductUsed =
    !!initialData?._count?.variants && initialData?._count?.variants > 0;

  const isArchived =
    !!initialData?.deletedAt && initialData?.status === "ARCHIVED";

  const mediaRef = useRef<MultiImageFormFieldRef>(null);
  const featuredImageRef = useRef<ImageFormFieldRef>(null);
  const currentImages = form.formState?.defaultValues?.images?.map(
    (image) => `${env.NEXT_PUBLIC_STORAGE_URL}/products/${image}`,
  );
  const currentFeaturedImage = form.formState?.defaultValues?.featuredImage
    ? `${env.NEXT_PUBLIC_STORAGE_URL}/products/${form.formState?.defaultValues?.featuredImage}`
    : undefined;

  const isFormDisabled =
    createProduct.isPending ||
    updateProduct.isPending ||
    deleteProduct.isPending ||
    (featuredImageRef.current?.isUploading ?? false) ||
    (mediaRef.current?.isUploading ?? false) ||
    isArchived ||
    wasProductUsed;

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          onChange={() => console.log(form.watch())}
        >
          <FormHeader title={title} link={`/${storeSlug}/products`}>
            {initialData && (
              <FormAdditionalOptionsButton
                onDelete={onDelete}
                onDuplicate={onSaveAndDuplicate}
              />
            )}

            <FormSaveOptionsButton
              onSave={() => onSave(form.getValues(), false)}
              onPublish={() => onSave(form.getValues(), true)}
              isLoading={isFormDisabled}
            />
          </FormHeader>
          {wasProductUsed && (
            <Alert className="mx-auto mt-4 w-full max-w-5xl">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                This product has been used in at least one order. You can
                archive the product to remove it from the store, but it will
                still remain in your products.
              </AlertDescription>
            </Alert>
          )}
          <section className="form-body grid w-full grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-7">
              <ProductDetailsSection form={form} loading={isFormDisabled} />
              <ProductInventorySection form={form} loading={isFormDisabled} />
            </div>

            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-5">
              <SingleCheckboxFormField
                form={form}
                name="isFeatured"
                label="Featured"
                description="This product will appear on the home page"
              />
              <FormSection
                title="Media"
                description="Upload images for your product."
                bodyClassName="space-y-4 w-full"
              >
                <ImageFormField
                  form={form}
                  ref={featuredImageRef}
                  label="Featured Image"
                  disabled={isFormDisabled}
                  isRequired={true}
                  route="product"
                  apiUrl="/api/upload-product"
                  name="featuredImage"
                  tempName="tempFeaturedImage"
                  currentImageUrl={currentFeaturedImage}
                />
                <MultiImageFormField
                  form={form}
                  ref={mediaRef}
                  name="images"
                  tempName="tempImages"
                  label="Images and Vids"
                  disabled={isFormDisabled}
                  isRequired={false}
                  route="images"
                  apiUrl="/api/upload-product"
                  currentImageUrls={currentImages}
                  imagePrefix={`${env.NEXT_PUBLIC_STORAGE_URL}/products/`}
                />
              </FormSection>
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};
