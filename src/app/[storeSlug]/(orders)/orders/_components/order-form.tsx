"use client";

import type { Tag } from "emblor";
import { uniqueId } from "lodash";
import { useForm } from "react-hook-form";

import type { Customer } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";

import type { DraftOrderFormData } from "~/lib/validators/order";
import type { CustomerWithOrders } from "~/types/customer";
import type { OrderWithOrderItems } from "~/types/order";
import type { PartialProduct, ProductWithVariations } from "~/types/product";
import { draftOrderFormValidator } from "~/lib/validators/order";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { Card } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { TagFormField } from "~/components/input/tag-form-field";
import { TextareaFormField } from "~/components/input/textarea-form-field";
import { FormAdditionalOptionsButton } from "~/components/shared/form-additional-options-button";
import { FormDiscardButton } from "~/components/shared/form-discard-button";
import { FormHeader } from "~/components/shared/form-header";
import { LoadButton } from "~/components/shared/load-button";

import { DraftCustomerSection } from "../../draft-orders/_components/draft-customer-section";
import { DraftOrderItemSection } from "../../draft-orders/_components/draft-order-item-section";
import { DraftPaymentsSection } from "../../draft-orders/_components/draft-payments-section";

type Props = {
  initialData: OrderWithOrderItems | null;
  products: PartialProduct[];
  customers: Customer[];
  storeId: string;
  storeSlug: string;
};

export const OrderForm = ({
  initialData,
  products,
  customers,
  storeId,
  storeSlug,
}: Props) => {
  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["order"],
    redirectPath: `/${storeSlug}/orders`,
  });

  const title = initialData ? "Edit order" : "Create order";

  const createDraftOrder = api.order.createDraft.useMutation(defaultActions);
  const updateDraftOrder = api.order.updateDraft.useMutation(defaultActions);
  const deleteOrder = api.order.delete.useMutation(defaultActions);

  const form = useForm<DraftOrderFormData>({
    resolver: zodResolver(draftOrderFormValidator),
    defaultValues: {
      orderItems: initialData?.orderItems
        ? (initialData?.orderItems.map((item) => ({
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
          })) as DraftOrderFormData["orderItems"])
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
    console.log({
      ...data,
      storeId,
      customerId: data.customer.id,
      subtotalInCents: data.orderItems.reduce(
        (acc, item) => acc + item.totalPriceInCents * item.quantity,
        0,
      ),
      tags: data.tags.map((tag) => tag.text),
    });

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
        productRequestId: data.productRequestId ?? undefined,
        customerId: data.customer.id,
        subtotalInCents: data.orderItems.reduce(
          (acc, item) => acc + item.totalPriceInCents * item.quantity,
          0,
        ),
        tags: data.tags.map((tag) => tag.text),
      });

    // if (initialData)
    //   updateOrder.mutate({
    //     ...data,
    //     orderId: initialData.id,
    //     customerId: data.customer.id,
    //     subtotalInCents: data.orderItems.reduce(
    //       (acc, item) => acc + item.totalPriceInCents * item.quantity,
    //       0,
    //     ),
    //     tags: data.tags.map((tag) => tag.text),
    //   });
    // else
    //   createOrder.mutate({
    //     ...data,
    //     storeId,
    //     customerId: data.customer.id,
    //     subtotalInCents: data.orderItems.reduce(
    //       (acc, item) => acc + item.totalPriceInCents * item.quantity,
    //       0,
    //     ),
    //     tags: data.tags.map((tag) => tag.text),
    //   });
  };
  const onDelete = () =>
    initialData ? deleteOrder.mutate(initialData.id) : null;

  const isLoading = false;

  // const onSave = (data: DraftOrderFormData) => {
  //   if (initialData)
  //     updateDraftOrder.mutate({
  //       ...data,
  //       orderId: initialData.id,
  //       customerId: data.customer.id,
  //       subtotalInCents: data.orderItems.reduce(
  //         (acc, item) => acc + item.totalPriceInCents * item.quantity,
  //         0,
  //       ),
  //       tags: data.tags.map((tag) => tag.text),
  //     });
  //   else
  //     createDraftOrder.mutate({
  //       ...data,
  //       storeId,
  //       productRequestId: data.productRequestId ?? undefined,
  //       customerId: data.customer.id,
  //       subtotalInCents: data.orderItems.reduce(
  //         (acc, item) => acc + item.totalPriceInCents * item.quantity,
  //         0,
  //       ),
  //       tags: data.tags.map((tag) => tag.text),
  //     });
  // };
  console.log(initialData);
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

            {/* <FormSaveOptionsButton
              onSave={() => onSave(form.getValues(), false)}
              onPublish={() => onSave(form.getValues(), true)}
              isLoading={isLoading}
            /> */}

            <FormDiscardButton
              isLoading={isLoading}
              redirectPath={`/${storeSlug}/orders`}
            />

            <LoadButton variant="outline" type="submit" isLoading={isLoading}>
              Save Draft
            </LoadButton>
          </FormHeader>
          <section className="form-body grid w-full grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-7">
              <DraftOrderItemSection
                form={form}
                loading={isLoading}
                products={products as ProductWithVariations[]}
              />

              <DraftPaymentsSection
                form={form}
                loading={isLoading}
                products={products}
              />
            </div>
            <div className="col-span-12 flex w-full flex-col space-y-4 xl:col-span-5">
              <DraftCustomerSection
                form={form}
                customers={customers as CustomerWithOrders[]}
                isLoading={isLoading}
                storeSlug={storeSlug}
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
