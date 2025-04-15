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
import { draftOrderFormValidator } from "~/lib/validators/order";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
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
};

export const DraftOrderForm = ({
  initialData,
  products,
  customers,
  storeId,
  storeSlug,
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

      isTaxExempt: false,
      tags:
        initialData?.tags && initialData?.tags.length > 0
          ? (initialData?.tags?.map((tag) => ({
              text: tag,
              id: uniqueId(),
            })) as Tag[])
          : [],
      notes: initialData?.notes ?? "",
      customer: {
        id: initialData?.customerId ?? "",
        firstName: initialData?.customer?.firstName ?? "",
        lastName: initialData?.customer?.lastName ?? "",
        email: initialData?.customer?.email ?? "",
        phone: initialData?.customer?.phone ?? "",
        addresses: initialData?.customer?.addresses ?? [],
        ordersCount: initialData?.customer?._count?.orders ?? 0,
      },
      shippingAddressId:
        initialData?.shippingAddressId ??
        initialData?.customer?.addresses?.find((address) => address.isDefault)
          ?.id ??
        undefined,
      billingAddressId:
        initialData?.billingAddressId ??
        initialData?.customer?.addresses?.find((address) => address.isDefault)
          ?.id ??
        undefined,
      shippingAddress:
        initialData?.shippingAddress ??
        initialData?.customer?.addresses?.find(
          (address) => address.isDefault,
        ) ??
        undefined,
      billingAddress:
        initialData?.billingAddress ??
        initialData?.customer?.addresses?.find(
          (address) => address.isDefault,
        ) ??
        undefined,
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
          <FormHeader title={title} link={`/${storeSlug}/orders`}>
            {initialData && <FormAdditionalOptionsButton onDelete={onDelete} />}

            <LoadButton type="submit" isLoading={isLoading}>
              Save Draft
            </LoadButton>
          </FormHeader>
          <section className="form-body grid w-full grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-7">
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
                    <Button>Send Invoice</Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Collect Payment</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Payment Methods</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem>Payment link</DropdownMenuItem>

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
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-5">
              <DraftCustomerSection
                form={form}
                customers={customers ?? []}
                isLoading={isLoading}
              />
              <Card className="px-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notes</h3>
                    <TextareaFormField
                      form={form}
                      name="notes"
                      label="Notes (optional)"
                      placeholder="Notes for the order"
                    />
                  </div>
                </div>
              </Card>

              <Card className="px-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tags</h3>

                    <TagFormField
                      form={form}
                      defaultTags={form.getValues("tags") ?? []}
                      name="tags"
                      label="Tags (optional)"
                      description="Tags are used to categorize your orders. You can add multiple tags to an order."
                    />
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};
