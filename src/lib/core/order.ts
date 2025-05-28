import { db } from "~/server/db";
import {
  generateOrderAuthNumber,
  generateOrderNumber,
} from "~/utils/generate-order-numbers";

import {
  addressesAreSame,
  lineToOrderItems,
  paymentService,
} from "@atomic-trade/payments";
import { FulfillmentStatus } from "@prisma/client";

import {
  createPaymentIntent,
  getOrCreateAddress,
  getOrCreateCustomer,
} from "~/lib/core/payments";

export const webhookDataToUpdateOrder = async (
  session: unknown,
  storeSlug: string,
) => {
  const checkoutSessionData =
    await paymentService.checkout.formatCheckoutSessionData({
      session,
    });
  const email = checkoutSessionData.customer.email;
  const storeMetaId = checkoutSessionData.storeId;
  const sessionId = checkoutSessionData.sessionId ?? "";

  const store = await db.store.findFirst({
    where: {
      OR: [{ slug: storeSlug }, { id: storeMetaId ?? "" }],
    },
  });

  const numberOfOrders = await db.order.count({
    where: {
      storeId: store?.id ?? "",
      status: { not: "DRAFT" },
    },
  });

  const customer = await getOrCreateCustomer({
    storeId: store?.id ?? "",
    email: email ?? "",
    customerName: checkoutSessionData.customer.name ?? "",
    address: checkoutSessionData.shippingAddress ?? null,
  });

  const sameAddress = addressesAreSame(
    checkoutSessionData.shippingAddress ?? null,
    checkoutSessionData.billingAddress ?? null,
  );

  const shippingAddress = await getOrCreateAddress({
    customerAddresses: customer?.addresses ?? [],
    address: checkoutSessionData.shippingAddress ?? null,
    customerName: checkoutSessionData.shippingAddress.name ?? "",
    customerId: customer?.id ?? "",
    customerPhone: checkoutSessionData.customer.phone ?? "",
  });

  const billingAddress = sameAddress
    ? shippingAddress
    : await getOrCreateAddress({
        customerAddresses: customer?.addresses ?? [],
        address: checkoutSessionData.billingAddress ?? null,
        customerName: checkoutSessionData.billingAddress.name ?? "",
        customerId: customer?.id ?? "",
        customerPhone: checkoutSessionData.customer.phone ?? "",
      });

  const handleVariant = async (variantId: string, quantity: number) => {
    const variant = variantId
      ? await db.variation.findUnique({
          where: { id: variantId },
        })
      : null;

    if (variant?.manageStock) {
      const currentStock = variant.stock;
      if (currentStock < quantity || currentStock === 0) {
        throw new Error("Insufficient stock");
      }

      await db.variation.update({
        where: { id: variant.id },
        data: { stock: currentStock - quantity },
      });
    }

    return variant;
  };

  const { orderItems, discountInCents, subtotalInCents } =
    await lineToOrderItems({
      sessionId,
      handleStockUpdate: handleVariant,
    });
  const orderNumber = generateOrderNumber(numberOfOrders, storeSlug);
  const authorizationCode = generateOrderAuthNumber();

  const { paymentReceipt, processorFee } =
    await paymentService.transaction.getPaymentIntent({
      paymentIntentId: checkoutSessionData.intentId ?? "",
    });

  // Create new address records first
  let newShippingAddress = null;
  let newBillingAddress = null;

  if (shippingAddress?.formatted) {
    newShippingAddress = await db.address.create({
      data: {
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        additional: shippingAddress.additional,
        formatted: shippingAddress.formatted,
        phone: shippingAddress.phone,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
      },
    });
  }

  if (billingAddress?.formatted && !sameAddress) {
    newBillingAddress = await db.address.create({
      data: {
        street: billingAddress.street,
        city: billingAddress.city,
        state: billingAddress.state,
        postalCode: billingAddress.postalCode,
        country: billingAddress.country,
        additional: billingAddress.additional,
        formatted: billingAddress.formatted,
        phone: billingAddress.phone,
        firstName: billingAddress.firstName,
        lastName: billingAddress.lastName,
      },
    });
  }

  const order = await db.order.create({
    data: {
      email,
      phone: checkoutSessionData.customer.phone ?? "",
      storeId: checkoutSessionData.storeId ?? "",
      orderNumber,
      authorizationCode,
      paymentStatus: "PAID",
      status: "PENDING",
      fulfillmentStatus: "IN_PROGRESS",
      discountInCents,
      subtotalInCents,
      totalInCents: checkoutSessionData.totals.total ?? 0,
      taxInCents: checkoutSessionData.totals.tax ?? 0,
      shippingInCents: checkoutSessionData.totals.shipping ?? 0,
      feeInCents: processorFee,
      customerId: customer?.id ?? "",
      shippingAddressId: newShippingAddress?.id ?? "",
      billingAddressId: sameAddress
        ? newShippingAddress?.id
        : (newBillingAddress?.id ?? ""),
      orderItems: { create: orderItems },
      areAddressesSame: sameAddress,
      metadata: { ...checkoutSessionData.orderMetadata },
      receiptLink: paymentReceipt,
    },
  });

  await createPaymentIntent({
    sessionId: checkoutSessionData.sessionId ?? "",
    orderId: order.id,
  });

  await db.timelineEvent.create({
    data: {
      orderId: order.id,
      title: "Order created",
      description: `Order placed and paid on ${new Date().toLocaleString()}`,
      isEditable: false,
    },
  });

  await db.fulfillment.create({
    data: {
      order: { connect: { id: order.id } },
      status: FulfillmentStatus.PENDING,
    },
  });

  return order;
};
