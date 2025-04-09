"use client";

import { useForm } from "react-hook-form";

import { toastService } from "@dreamwalker-studios/toasts";
import { zodResolver } from "@hookform/resolvers/zod";

import type { BrandingFormData } from "~/lib/validators/store";
import type { Store } from "~/types/store";
import { env } from "~/env";
import { useFileUpload } from "~/lib/file-upload/hooks/use-file-upload";
import { cn } from "~/lib/utils";
import { brandingSettingsValidator } from "~/lib/validators/store";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Form } from "~/components/ui/form";
import { ImageFormField } from "~/components/input/image-form-field";
import { InputFormField } from "~/components/input/input-form-field";
import { PhoneFormField } from "~/components/input/phone-form-field";
import { FormDiscardButton } from "~/components/shared/form-discard-button";
import { FormHeader } from "~/components/shared/form-header";
import { FormSection } from "~/components/shared/form-section";
import { LoadButton } from "~/components/shared/load-button";

type Props = { initialData: Store; slug: string };

export const BrandingForm = ({ initialData, slug }: Props) => {
  const { uploadFile, isUploading } = useFileUpload({
    route: "misc",
    api: "/api/upload-misc",
  });

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["store"],
  });

  const form = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSettingsValidator),
    defaultValues: {
      businessName: initialData?.name ?? "",
      businessEmail: initialData?.contactEmail ?? "",
      businessPhone: initialData?.contactPhone ?? "",
      image: null,
    },
  });

  const updateBrandingSettings =
    api.store.updateBrandingSettings.useMutation(defaultActions);

  const onSubmit = async (data: BrandingFormData) => {
    let image_name: string | null = initialData?.logo ?? null;

    if (!data.image && !initialData?.logo) {
      toastService.error("Please upload an image");
      return;
    }

    if (data.image) {
      image_name = await uploadFile(data.image as File);

      if (!image_name) {
        toastService.error("Error uploading image");
        return;
      }
    }

    if (image_name) {
      updateBrandingSettings.mutate({
        storeId: initialData.id,
        businessName: data.businessName,
        businessEmail: data.businessEmail,
        businessPhone: data.businessPhone,
        image: image_name ?? undefined,
      });
    }
  };

  const loading = updateBrandingSettings.isPending || isUploading;
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <FormHeader title="Branding Settings" link={`/${slug}/dashboard`}>
            <FormDiscardButton
              isLoading={loading}
              redirectPath={`/${slug}/dashboard`}
            />
            <LoadButton isLoading={loading} type="submit">
              Save changes
            </LoadButton>
          </FormHeader>

          <section className="form-body">
            <div className={cn("flex w-full flex-col space-y-4")}>
              <FormSection
                title="Public Information"
                description="Set up your store's name and contact information."
                bodyClassName="space-y-4"
              >
                <InputFormField
                  form={form}
                  name="businessName"
                  label="Store Name"
                  placeholder="e.g Cool Store Inc."
                />

                <InputFormField
                  form={form}
                  name="businessEmail"
                  label="Email (Optional)"
                  placeholder="e.g business@email.com"
                  description="This email will used for all email communications from your store. We do abstract this email so that users only see it as support@yourstore.com"
                />
                <PhoneFormField
                  form={form}
                  name="businessPhone"
                  label="Phone (Optional)"
                  placeholder="e.g (123) 456-7890"
                  description="Setting this will allow customers to contact you via phone. This will be displayed on your store's contact page."
                />

                <ImageFormField
                  form={form}
                  name="image"
                  label="Store logo"
                  currentImageUrl={
                    initialData
                      ? `${env.NEXT_PUBLIC_STORAGE_URL}/misc/${initialData.logo}`
                      : undefined
                  }
                />
              </FormSection>
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};
