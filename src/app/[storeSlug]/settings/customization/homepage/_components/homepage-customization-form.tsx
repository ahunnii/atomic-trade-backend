"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";

import type { HomePageSettings } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { HeroType } from "@prisma/client";

import type { ImageFormFieldRef } from "~/components/input/image-form-field";
import type { MultiImageFormFieldRef } from "~/components/input/multi-image-form-field";
import type { HomepageSettingsFormData } from "~/lib/validators/settings";
import { env } from "~/env";
import { cn } from "~/lib/utils";
import { homepageSettingsValidator } from "~/lib/validators/settings";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Form } from "~/components/ui/form";
import { ImageFormField } from "~/components/input/image-form-field";
import { InputFormField } from "~/components/input/input-form-field";
import { MultiImageFormField } from "~/components/input/multi-image-form-field";
import { SingleCheckboxFormField } from "~/components/input/single-checkbox-form-field";
import { FormDiscardButton } from "~/components/shared/form-discard-button";
import { FormHeader } from "~/components/shared/form-header";
import { FormSection } from "~/components/shared/form-section";
import { LoadButton } from "~/components/shared/load-button";

type Props = {
  initialData: HomePageSettings | null;
  storeId: string;
  slug: string;
};

export const HomepageCustomizationForm = ({
  initialData,
  storeId,
  slug,
}: Props) => {
  const parentPath = `/${slug}/settings`;
  const mediaRef = useRef<MultiImageFormFieldRef>(null);
  const featuredImageRef = useRef<ImageFormFieldRef>(null);

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["store"],
  });

  const form = useForm<HomepageSettingsFormData>({
    resolver: zodResolver(homepageSettingsValidator),
    defaultValues: {
      heroType: initialData?.heroType ?? HeroType.SINGLE_IMAGE,
      tempImages: [],
      heroImages: initialData?.heroImages ?? [],
      heroTitle: initialData?.heroTitle ?? "",
      heroSubtitle: initialData?.heroSubtitle ?? "",
      heroButtonText: initialData?.heroButtonText ?? "",
      heroButtonLink: initialData?.heroButtonLink ?? "",
      enableCallToAction: initialData?.enableCallToAction ?? false,
      enableCollectionsSection: initialData?.enableCollectionsSection ?? false,
      enableBlogSection: initialData?.enableBlogSection ?? false,

      callToActionTitle: initialData?.callToActionTitle ?? "",
      callToActionSubtitle: initialData?.callToActionSubtitle ?? "",
      callToActionButtonText: initialData?.callToActionButtonText ?? "",
      callToActionButtonLink: initialData?.callToActionButtonLink ?? "",
      callToActionImage: initialData?.callToActionImage ?? "",
      tempCallToActionImage: null,
    },
  });

  const currentImages = form.formState?.defaultValues?.heroImages?.map(
    (image) => `${env.NEXT_PUBLIC_STORAGE_URL}/misc/${image}`,
  );
  const currentFeaturedImage = form.formState?.defaultValues?.callToActionImage
    ? `${env.NEXT_PUBLIC_STORAGE_URL}/misc/${form.formState?.defaultValues?.callToActionImage}`
    : undefined;

  const updateHomepageSettings =
    api.store.updateHomepageSettings.useMutation(defaultActions);

  const onSubmit = async (data: HomepageSettingsFormData) => {
    const images = await mediaRef.current?.upload();
    const featuredImage = await featuredImageRef.current?.upload();

    if (images) {
      updateHomepageSettings.mutate({
        storeId,
        ...data,
        heroImages: images,
        callToActionImage:
          featuredImage ?? initialData?.callToActionImage ?? undefined,
        heroType: images.length > 0 ? HeroType.GALLERY : HeroType.SINGLE_IMAGE,
      });
    }
  };

  const loading =
    updateHomepageSettings.isPending ||
    (mediaRef.current?.isUploading ?? false) ||
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
          <FormHeader title="Homepage Customization" link={parentPath}>
            <FormDiscardButton isLoading={loading} redirectPath={parentPath} />
            <LoadButton isLoading={loading} type="submit">
              Save changes
            </LoadButton>
          </FormHeader>

          <section className="form-body">
            <div className={cn("flex w-full flex-col space-y-4 xl:col-span-7")}>
              <FormSection
                title="Hero Section"
                description="Set up your store's hero section."
                bodyClassName="space-y-4"
              >
                <InputFormField
                  form={form}
                  name="heroTitle"
                  label="Title"
                  placeholder="e.g Cool Store Inc."
                />

                <InputFormField
                  form={form}
                  name="heroSubtitle"
                  label="Subtitle"
                  placeholder="e.g Cool Store Inc."
                  description="This subtitle will be displayed below the title."
                />

                <InputFormField
                  form={form}
                  name="heroButtonText"
                  label="Button Text"
                  placeholder="e.g Shop Now"
                  description="This button text will be displayed on the hero section."
                />

                <InputFormField
                  form={form}
                  name="heroButtonLink"
                  label="Button Link"
                  placeholder="e.g /shop"
                  description="This button link will be displayed on the hero section."
                />

                <MultiImageFormField
                  form={form}
                  ref={mediaRef}
                  name="heroImages"
                  tempName="tempImages"
                  label="Images"
                  disabled={loading}
                  isRequired={false}
                  route="images"
                  apiUrl="/api/upload-misc"
                  currentImageUrls={currentImages}
                  imagePrefix={`${env.NEXT_PUBLIC_STORAGE_URL}/misc/`}
                />
              </FormSection>

              <FormSection
                title="Call to Action Section"
                description="Set up your store's call to action section."
                bodyClassName="space-y-4"
              >
                <ImageFormField
                  form={form}
                  ref={featuredImageRef}
                  label="Featured Image"
                  disabled={loading}
                  isRequired={true}
                  route="misc"
                  apiUrl="/api/upload-misc"
                  name="callToActionImage"
                  tempName="tempCallToActionImage"
                  currentImageUrl={currentFeaturedImage}
                />

                <InputFormField
                  form={form}
                  name="callToActionTitle"
                  label="Title"
                  placeholder="e.g Shop Now"
                />

                <InputFormField
                  form={form}
                  name="callToActionSubtitle"
                  label="Subtitle"
                  placeholder="e.g Shop Now"
                />

                <InputFormField
                  form={form}
                  name="callToActionButtonText"
                  label="Button Text"
                  placeholder="e.g Shop Now"
                />

                <InputFormField
                  form={form}
                  name="callToActionButtonLink"
                  label="Button Link"
                  placeholder="e.g /shop"
                />
              </FormSection>

              <FormSection
                title=" Sections"
                description="Set up your store's collections section."
                bodyClassName="space-y-4"
              >
                <SingleCheckboxFormField
                  form={form}
                  name="enableCollectionsSection"
                  label="Enable Collections Section"
                />
                <SingleCheckboxFormField
                  form={form}
                  name="enableBlogSection"
                  label="Enable Blog Section"
                />
                <SingleCheckboxFormField
                  form={form}
                  name="enableCallToAction"
                  label="Enable Call to Action"
                />
              </FormSection>
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};
