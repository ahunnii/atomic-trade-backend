"use client";

import { useForm } from "react-hook-form";

import { toastService } from "@dreamwalker-studios/toasts";
import { zodResolver } from "@hookform/resolvers/zod";

import { AutoCompleteAddressFormField } from "~/components/input/autocomplete-address-form-field";
import { ImageFormField } from "~/components/input/image-form-field";
import { InputFormField } from "~/components/input/input-form-field";
import { LoadButton } from "~/components/shared/load-button";

import { Form } from "~/components/ui/form";
import { ScrollArea } from "~/components/ui/scroll-area";

import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";

import { useFileUpload } from "~/lib/file-upload/hooks/use-file-upload";

import { api } from "~/trpc/react";

import { useRouter } from "next/navigation";
import type { WelcomeFormData } from "../_validators/schema";
import { welcomeFormValidator } from "../_validators/schema";

export const WelcomeForm = () => {
  const router = useRouter();
  const { uploadFile, isUploading } = useFileUpload({
    route: "misc",
    api: "/api/upload-misc",
  });

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["store"],
  });

  const form = useForm<WelcomeFormData>({
    resolver: zodResolver(welcomeFormValidator),
    defaultValues: {
      name: "",
      address: {
        formatted: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      logo: null,
    },
  });

  const createStore = api.store.create.useMutation({
    ...defaultActions,
    onSuccess: ({ message, data }) => {
      toastService.success(message);

      void router.push(`/${data.slug}/dashboard`);
    },
  });

  async function onSubmit(data: WelcomeFormData) {
    let image_name: string | null = null;

    if (!data.logo) {
      toastService.error("Please upload an image");
      return;
    }

    if (data.logo) {
      image_name = await uploadFile(data.logo as File);

      if (!image_name) {
        toastService.error("Error uploading your logo");
        return;
      }
    }

    if (image_name) {
      createStore.mutate({
        ...data,
        logo: image_name,
      });
    }
  }

  const isLoading = createStore.isPending || isUploading;

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          className="h-full w-full"
        >
          <div className="flex flex-col gap-4 p-1 md:grid md:grid-cols-6">
            <InputFormField
              form={form}
              name="name"
              label="Store name"
              placeholder="e.g Super Cool Store Inc."
              className="col-span-full"
            />
            <AutoCompleteAddressFormField
              form={form}
              name="address.formatted"
              labelClassName="text-sm font-normal text-muted-foreground"
              label="Store address"
              description="This is where the store is located. Used for billing and shipping purposes."
              defaultValue={{
                formatted: form.getValues("address")?.formatted ?? "",
                street: form.getValues("address")?.street ?? "",
                city: form.getValues("address")?.city ?? "",
                state: form.getValues("address")?.state ?? "",
                postalCode: form.getValues("address")?.postalCode ?? "",
                country: form.getValues("address")?.country ?? "",
              }}
              onSelectAdditional={(address) => {
                form.setValue("address", address);
              }}
            />
            <ImageFormField form={form} name="logo" label="Store logo" />{" "}
          </div>

          <div className="mt-4 flex h-auto justify-end gap-2">
            <LoadButton
              isLoading={isLoading}
              loadingText="Creating store..."
              type="submit"
            >
              {"Create your store"}
            </LoadButton>
          </div>
        </form>{" "}
      </Form>{" "}
    </>
  );
};
