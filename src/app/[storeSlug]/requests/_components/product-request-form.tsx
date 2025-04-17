"use client";

import type { Tag } from "emblor";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { uniqueId } from "lodash";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import type { MultiImageFormFieldRef } from "~/components/input/multi-image-form-field";
import type { CustomerFormData } from "~/lib/validators/customer";
import type { Address } from "~/lib/validators/geocoding";
import type { ProductRequestFormData } from "~/lib/validators/product-request";
import type { Customer } from "~/types/customer";
import type { ProductRequest } from "~/types/product-request";
import { env } from "~/env";
import { customerValidator } from "~/lib/validators/customer";
import { productRequestFormValidator } from "~/lib/validators/product-request";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { AutoCompleteAddressFormField } from "~/components/input/autocomplete-address-form-field";
import { InputFormField } from "~/components/input/input-form-field";
import { MultiImageFormField } from "~/components/input/multi-image-form-field";
import { PhoneFormField } from "~/components/input/phone-form-field";
import { TagFormField } from "~/components/input/tag-form-field";
import { TextareaFormField } from "~/components/input/textarea-form-field";
import { FormAdditionalOptionsButton } from "~/components/shared/form-additional-options-button";
import { FormCardSection } from "~/components/shared/form-card-section";
import { FormHeader } from "~/components/shared/form-header";
import { FormSection } from "~/components/shared/form-section";
import { LoadButton } from "~/components/shared/load-button";

import { CreateQuoteDialog } from "./create-quote-dialog";
import { SimplifiedCustomerFormField } from "./simplified-customer-form-field";

type Props = {
  initialData: ProductRequest | null;
  storeSlug: string;
  storeId: string;
  customers: Customer[];
};

export const ProductRequestForm = ({
  initialData,
  storeSlug,
  storeId,
  customers,
}: Props) => {
  const router = useRouter();
  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["productRequest"],
    redirectPath: `/${storeSlug}/requests`,
  });

  const title = initialData ? "Edit product request" : "Create product request";

  const updateCustomer = api.productRequest.update.useMutation(defaultActions);
  const createCustomer = api.productRequest.create.useMutation(defaultActions);
  const deleteCustomer = api.productRequest.delete.useMutation(defaultActions);
  const createQuote = api.productRequest.sendNewQuote.useMutation({
    ...defaultActions,
    onSuccess: ({ message }) => {
      defaultActions.onSuccess?.({ message, cancelRedirect: true });
    },
  });
  const resendQuote = api.productRequest.resendQuote.useMutation({
    ...defaultActions,
    onSuccess: ({ message }) => {
      defaultActions.onSuccess?.({ message, cancelRedirect: true });
    },
  });
  const updateQuoteStatus = api.productRequest.updateQuoteStatus.useMutation({
    ...defaultActions,
    onSuccess: ({ message }) => {
      defaultActions.onSuccess?.({ message, cancelRedirect: true });
    },
  });

  const form = useForm<ProductRequestFormData>({
    resolver: zodResolver(productRequestFormValidator),
    defaultValues: {
      customer: {
        id: initialData?.customerId ?? "",
        firstName: initialData?.customer?.firstName ?? "",
        lastName: initialData?.customer?.lastName ?? "",
        email: initialData?.customer?.email ?? "",
        phone: initialData?.customer?.phone ?? "",
        ordersCount: initialData?.customer?._count?.orders ?? 0,
      },
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      firstName: initialData?.firstName ?? "",
      lastName: initialData?.lastName ?? "",
      details: initialData?.details ?? "",
      tempImages: [],
      images: initialData?.images ?? [],
      status: initialData?.status ?? "PENDING",
      customerId: initialData?.customerId ?? undefined,
      orderId: initialData?.orderId ?? "",
      quotes: initialData?.quotes ?? [],
    },
  });

  const onSubmit = (data: ProductRequestFormData) => {
    void onSave(data);
  };

  const onSave = async (data: ProductRequestFormData) => {
    const uploadedImages = await mediaRef.current?.upload();

    if (initialData)
      updateCustomer.mutate({
        ...data,
        requestId: initialData.id,
        images: uploadedImages ?? initialData?.images ?? undefined,
      });
    else
      createCustomer.mutate({ ...data, storeId, images: uploadedImages ?? [] });
  };

  const onDelete = () => deleteCustomer.mutate(initialData?.id ?? "");

  const isLoading =
    updateCustomer.isPending ||
    createCustomer.isPending ||
    deleteCustomer.isPending;

  const mediaRef = useRef<MultiImageFormFieldRef>(null);

  const currentImages = form.formState?.defaultValues?.images?.map(
    (image) => `${env.NEXT_PUBLIC_STORAGE_URL}/misc/${image}`,
  );
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          onChange={() => console.log(form.formState.errors)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <FormHeader title={title} link={`/${storeSlug}/requests`}>
            {initialData && (
              <FormAdditionalOptionsButton
                onDelete={onDelete}
                onMisc={() =>
                  router.push(
                    `/${storeSlug}/draft-orders/new?productRequestId=${initialData?.id}`,
                  )
                }
                onMiscLabel="Create order from request"
              />
            )}

            {initialData && (
              <CreateQuoteDialog
                form={form}
                loading={isLoading}
                onSubmit={(data) => {
                  createQuote.mutate({
                    amountInCents: data.price,
                    requestId: initialData?.id ?? "",
                    expiresAt: data.expiresAt ?? undefined,
                    status: "PENDING",
                    message: data.notes,
                  });
                }}
              >
                <LoadButton
                  variant="outline"
                  isLoading={createQuote.isPending}
                  type="button"
                >
                  Create Quote
                </LoadButton>
              </CreateQuoteDialog>
            )}
            <LoadButton isLoading={isLoading} type="submit">
              Save
            </LoadButton>
          </FormHeader>

          <section className="form-body grid w-full grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-8">
              <FormCardSection title="Customer Details">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputFormField
                    form={form}
                    disabled={isLoading}
                    name="firstName"
                    label="First Name"
                    placeholder="e.g. John"
                    className="col-span-1"
                  />

                  <InputFormField
                    form={form}
                    disabled={isLoading}
                    name="lastName"
                    label="Last Name"
                    placeholder="e.g. Doe"
                    className="col-span-1"
                  />
                </div>
                <InputFormField
                  form={form}
                  name="email"
                  label="Email"
                  placeholder="e.g business@email.com"
                />
                <PhoneFormField
                  form={form}
                  name="phone"
                  label="Phone (Optional)"
                  placeholder="e.g (123) 456-7890"
                  description="Note that you should ask permission before sending SMS messages / calling customers."
                />

                <SimplifiedCustomerFormField
                  form={form}
                  label="Customer (optional)"
                  description="Link this request to an existing customer"
                  customers={customers}
                  initialData={initialData?.customer}
                />
              </FormCardSection>

              <FormCardSection title="Product Details">
                <TextareaFormField
                  form={form}
                  name="details"
                  label="Details"
                  placeholder="e.g. I need a new pair of shoes"
                />

                <MultiImageFormField
                  form={form}
                  ref={mediaRef}
                  name="images"
                  tempName="tempImages"
                  label="Images (optional)"
                  disabled={isLoading}
                  isRequired={false}
                  route="images"
                  apiUrl="/api/upload-misc"
                  currentImageUrls={currentImages}
                  imagePrefix={`${env.NEXT_PUBLIC_STORAGE_URL}/misc/`}
                />
              </FormCardSection>
            </div>
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-4">
              <FormCardSection title="Product Request Details">
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium">Request Status</h3>
                    <div className="mt-2 flex items-center">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          form.watch("status") === "PENDING"
                            ? "bg-yellow-500"
                            : form.watch("status") === "ACCEPTED"
                              ? "bg-green-500"
                              : form.watch("status") === "REJECTED"
                                ? "bg-red-500"
                                : "bg-gray-500"
                        }`}
                      />
                      <span className="ml-2 text-sm">
                        {form.watch("status") === "PENDING"
                          ? "Pending"
                          : form.watch("status") === "ACCEPTED"
                            ? "Accepted"
                            : form.watch("status") === "REJECTED"
                              ? "Rejected"
                              : "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Quotes</h3>
                      <span className="text-muted-foreground text-sm">
                        {form.watch("quotes")?.length || 0} sent
                      </span>
                    </div>

                    {form.watch("quotes")?.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {form.watch("quotes").map((quote, index) => (
                          <div
                            key={index}
                            className="bg-muted flex items-center justify-between rounded-md p-2 text-sm"
                          >
                            <div>
                              <span className="font-medium">
                                ${(quote.amountInCents / 100).toFixed(2)}
                              </span>
                              <span
                                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                                  quote.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : quote.status === "ACCEPTED"
                                      ? "bg-green-100 text-green-800"
                                      : quote.status === "REJECTED"
                                        ? "bg-red-100 text-red-800"
                                        : ""
                                }`}
                              >
                                {quote.status}
                              </span>
                            </div>
                            {quote.expiresAt && (
                              <span className="text-muted-foreground text-xs">
                                Expires:{" "}
                                {new Date(quote.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground mt-2 text-sm">
                        No quotes have been sent yet
                      </p>
                    )}
                  </div>

                  <div className="rounded-md border p-4">
                    <h3 className="font-medium">Important Dates</h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>
                          {initialData?.createdAt
                            ? new Date(
                                initialData.createdAt,
                              ).toLocaleDateString()
                            : "Not created yet"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Last Updated:
                        </span>
                        <span>
                          {initialData?.updatedAt
                            ? new Date(
                                initialData.updatedAt,
                              ).toLocaleDateString()
                            : "Not updated yet"}
                        </span>
                      </div>
                      {form
                        .watch("quotes")
                        ?.some((q) => q.status === "ACCEPTED") && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Quote Accepted:
                          </span>
                          <span>
                            {new Date(
                              form
                                .watch("quotes")
                                .find((q) => q.status === "ACCEPTED")
                                ?.updatedAt ?? "",
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </FormCardSection>
              <FormCardSection title="Quotes">
                {form.watch("quotes")?.length > 0 ? (
                  <div className="space-y-2">
                    {form
                      .watch("quotes")
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime(),
                      )
                      .map((quote, index) => (
                        <div
                          key={quote.id ?? index}
                          className="flex flex-col rounded-md border p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium">
                                ${(quote.amountInCents / 100).toFixed(2)}
                              </h4>
                              <Badge
                                variant={
                                  quote.status === "ACCEPTED"
                                    ? "default"
                                    : quote.status === "REJECTED"
                                      ? "destructive"
                                      : "outline"
                                }
                                className="text-xs"
                              >
                                {quote.status}
                              </Badge>
                            </div>
                            {quote.expiresAt && (
                              <span className="text-muted-foreground text-xs">
                                Expires:{" "}
                                {new Date(quote.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center justify-end gap-2">
                            {quote.status === "PENDING" && (
                              <>
                                <LoadButton
                                  variant="default"
                                  size="sm"
                                  className="h-8 bg-green-500 text-xs hover:bg-green-600"
                                  type="button"
                                  onClick={() => {
                                    if (quote.id) {
                                      updateQuoteStatus.mutate({
                                        quoteId: quote.id,
                                        status: "ACCEPTED",
                                      });
                                    }
                                  }}
                                  isLoading={updateQuoteStatus.isPending}
                                >
                                  Approve
                                </LoadButton>
                                <LoadButton
                                  variant="destructive"
                                  size="sm"
                                  type="button"
                                  className="h-8 text-xs"
                                  onClick={() => {
                                    if (quote.id) {
                                      updateQuoteStatus.mutate({
                                        quoteId: quote.id,
                                        status: "REJECTED",
                                      });
                                    }
                                  }}
                                  isLoading={updateQuoteStatus.isPending}
                                >
                                  Reject
                                </LoadButton>
                              </>
                            )}
                            <LoadButton
                              variant="outline"
                              size="sm"
                              type="button"
                              className="h-8 text-xs"
                              onClick={() => {
                                if (quote.id) {
                                  resendQuote.mutate(quote.id);
                                }
                              }}
                              isLoading={resendQuote.isPending}
                            >
                              Resend
                            </LoadButton>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                    <p className="text-muted-foreground mb-2">
                      No quotes have been created yet
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Use the &quot;Create Quote&quot; button to send a quote to
                      the customer
                    </p>
                  </div>
                )}
              </FormCardSection>
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};
