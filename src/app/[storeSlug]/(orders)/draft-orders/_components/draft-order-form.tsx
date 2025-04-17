"use client";

import type { Tag } from "emblor";
import { useRouter } from "next/navigation";
import { uniqueId } from "lodash";
import { useForm } from "react-hook-form";

import { toastService } from "@dreamwalker-studios/toasts";
import { zodResolver } from "@hookform/resolvers/zod";

import type { DraftOrderFormData } from "~/lib/validators/order";
import type { Customer } from "~/types/customer";
import type { Order } from "~/types/order";
import type { PartialProduct, Product } from "~/types/product";
import type { ProductRequest } from "~/types/product-request";
import { draftOrderFormValidator } from "~/lib/validators/order";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Form } from "~/components/ui/form";
import { Separator } from "~/components/ui/separator";
import { TagFormField } from "~/components/input/tag-form-field";
import { TextareaFormField } from "~/components/input/textarea-form-field";
import { FormAdditionalOptionsButton } from "~/components/shared/form-additional-options-button";
import { FormCardSection } from "~/components/shared/form-card-section";
import { FormHeader } from "~/components/shared/form-header";
import { LoadButton } from "~/components/shared/load-button";

import { AcceptDraftOrderPaymentDialog } from "./accept-draft-order-payment-dialog";
import { DraftCustomerSection } from "./draft-customer-section";
import { DraftOrderItemSection } from "./draft-order-item-section";
import { DraftPaymentsSection } from "./draft-payments-section";

type Props = {
  initialData: Order | null;
  products: PartialProduct[];
  customers: Customer[];
  storeId: string;
  storeSlug: string;
  productRequest: ProductRequest | null;
};

export const DraftOrderForm = ({
  initialData,
  products,
  customers,
  storeId,
  storeSlug,
  productRequest,
}: Props) => {
  const router = useRouter();
  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["order"],
    redirectPath: `/${storeSlug}/draft-orders`,
  });

  const title = initialData ? "Edit order" : "Create order";

  const createDraftOrder = api.order.createDraft.useMutation(defaultActions);
  const updateDraftOrder = api.order.updateDraft.useMutation(defaultActions);
  const deleteOrder = api.order.delete.useMutation(defaultActions);

  const collectDraftPayment = api.order.collectDraftPayment.useMutation({
    ...defaultActions,
    onSuccess: ({ data, message }) => {
      defaultActions.onSuccess({ message, cancelRedirect: true });
      router.push(`/${storeSlug}/orders/${data.order.id}`);
    },
  });

  const form = useForm<DraftOrderFormData>({
    resolver: zodResolver(draftOrderFormValidator),
    defaultValues: {
      orderItems: initialData?.orderItems
        ? initialData?.orderItems.map((item) => ({
            ...item,
            productId: item.variant?.product?.id,
            id: item.id,
            discountType:
              (
                item.metadata as {
                  discountType: "amount" | "percentage" | undefined;
                }
              )?.discountType ?? ("amount" as const),
            discountReason:
              (
                item.metadata as {
                  discountReason: string | undefined;
                }
              )?.discountReason ?? "",
          }))
        : [],
      discountInCents: initialData?.discountInCents ?? 0,
      discountType:
        (
          initialData?.metadata as {
            discountType: "amount" | "percentage" | undefined;
          }
        )?.discountType ?? ("amount" as const),
      discountReason:
        (
          initialData?.metadata as {
            discountReason: string | undefined;
          }
        )?.discountReason ?? "",

      isTaxExempt: initialData?.isTaxExempt ?? false,
      tags:
        initialData?.tags && initialData?.tags.length > 0
          ? (initialData?.tags?.map((tag) => ({
              text: tag,
              id: uniqueId(),
            })) as Tag[])
          : [],
      notes: initialData?.notes ?? "",
      customer: {
        id: initialData?.customerId ?? productRequest?.customer?.id ?? "",
        firstName:
          initialData?.customer?.firstName ??
          productRequest?.customer?.firstName ??
          "",
        lastName:
          initialData?.customer?.lastName ??
          productRequest?.customer?.lastName ??
          "",
        email:
          initialData?.customer?.email ?? productRequest?.customer?.email ?? "",
        phone:
          initialData?.customer?.phone ?? productRequest?.customer?.phone ?? "",
        addresses:
          initialData?.customer?.addresses ??
          productRequest?.customer?.addresses ??
          [],
        ordersCount:
          initialData?.customer?._count?.orders ??
          productRequest?.customer?._count?.orders ??
          0,
      },
      email: !!initialData?.email
        ? initialData?.email
        : (initialData?.customer?.email ?? productRequest?.email ?? ""),
      phone: !!initialData?.phone
        ? initialData?.phone
        : (initialData?.customer?.phone ?? productRequest?.phone ?? ""),
      shippingAddressId:
        initialData?.shippingAddressId ??
        initialData?.customer?.addresses?.find((address) => address.isDefault)
          ?.id ??
        productRequest?.customer?.addresses?.find(
          (address) => address.isDefault,
        )?.id ??
        undefined,
      billingAddressId:
        initialData?.billingAddressId ??
        initialData?.customer?.addresses?.find((address) => address.isDefault)
          ?.id ??
        productRequest?.customer?.addresses?.find(
          (address) => address.isDefault,
        )?.id ??
        undefined,
      shippingAddress:
        initialData?.shippingAddress ??
        initialData?.customer?.addresses?.find(
          (address) => address.isDefault,
        ) ??
        productRequest?.customer?.addresses?.find(
          (address) => address.isDefault,
        ) ??
        undefined,
      billingAddress:
        initialData?.billingAddress ??
        initialData?.customer?.addresses?.find(
          (address) => address.isDefault,
        ) ??
        productRequest?.customer?.addresses?.find(
          (address) => address.isDefault,
        ) ??
        undefined,

      productRequestId: productRequest?.id ?? undefined,
    },
  });

  const onSubmit = (data: DraftOrderFormData) => {
    if (initialData)
      updateDraftOrder.mutate({
        ...data,
        orderId: initialData.id,
        customerId: data.customer.id,
        subtotalInCents: data.orderItems.reduce(
          (acc, item) => acc + item.totalPriceInCents * item.quantity,
          0,
        ),
        tags: data.tags.map((tag) => tag.text),
      });
    else
      createDraftOrder.mutate({
        ...data,
        storeId,
        customerId: data.customer.id,
        subtotalInCents: data.orderItems.reduce(
          (acc, item) => acc + item.totalPriceInCents * item.quantity,
          0,
        ),
        tags: data.tags.map((tag) => tag.text),
        productRequestId: data.productRequestId ?? undefined,
      });
  };
  const onDelete = () =>
    initialData ? deleteOrder.mutate(initialData.id) : null;

  const isLoading =
    updateDraftOrder.isPending ||
    createDraftOrder.isPending ||
    deleteOrder.isPending;

  const onCollectPayment = async () => {
    if (!initialData) toastService.inform("Order not found");
    await collectDraftPayment.mutateAsync(initialData?.id ?? "");
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <FormHeader title={title} link={`/${storeSlug}/draft-orders`}>
            {initialData && <FormAdditionalOptionsButton onDelete={onDelete} />}

            <LoadButton type="submit" isLoading={isLoading}>
              Save Draft
            </LoadButton>
          </FormHeader>
          <section className="form-body grid w-full grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-8">
              {productRequest && (
                <FormCardSection title="Product Request">
                  <div className="space-y-4">
                    {productRequest.quotes &&
                      !productRequest?.quotes.some(
                        (quote) => quote.status === "ACCEPTED",
                      ) && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                          No quote has been accepted for this request. The price
                          hasn&apos;t been confirmed by either party.
                        </div>
                      )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">
                          Contact Information
                        </h3>
                        <div className="text-sm">
                          <p>
                            {productRequest.firstName} {productRequest.lastName}
                          </p>
                          <p>{productRequest.email}</p>
                          {productRequest.phone && (
                            <p>{productRequest.phone}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Request Details</h3>
                        <p className="text-sm">{productRequest.details}</p>
                      </div>
                    </div>

                    {productRequest?.quotes &&
                      productRequest?.quotes.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Quotes</h3>
                          <div className="space-y-2">
                            {productRequest?.quotes.map((quote, index) => (
                              <div
                                key={index}
                                className={`flex items-center justify-between rounded-md p-3 text-sm ${
                                  quote.status === "ACCEPTED"
                                    ? "border border-green-200 bg-green-50"
                                    : "border border-gray-200 bg-gray-50"
                                }`}
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
                                {quote.message && (
                                  <div className="max-w-[200px] truncate text-xs text-gray-500">
                                    {quote.message}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </FormCardSection>
              )}
              <DraftOrderItemSection
                form={form}
                loading={isLoading}
                products={products as Product[]}
              />

              <DraftPaymentsSection
                form={form}
                loading={isLoading}
                products={products as Product[]}
              >
                <Separator />

                {initialData ? (
                  <>
                    {/* <Button>Send Invoice</Button> */}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button>Collect Payment</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Payment Methods</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                            }}
                          >
                            <AcceptDraftOrderPaymentDialog
                              onAccept={onCollectPayment}
                            >
                              <div> Mark as paid </div>
                            </AcceptDraftOrderPaymentDialog>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>To collect payment, you must first save the draft order.</>
                )}
              </DraftPaymentsSection>
            </div>
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-4">
              <DraftCustomerSection
                form={form}
                customers={customers ?? []}
                isLoading={isLoading}
                storeSlug={storeSlug}
              />
              <FormCardSection title="Notes (optional)">
                <TextareaFormField
                  form={form}
                  name="notes"
                  placeholder="e.g. Order notes, special instructions, etc."
                />
              </FormCardSection>

              <FormCardSection title="Tags (optional)">
                <TagFormField
                  form={form}
                  defaultTags={form.getValues("tags") ?? []}
                  name="tags"
                  description="Tags are used to categorize your orders. You can add multiple tags to an order."
                />
              </FormCardSection>
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};
