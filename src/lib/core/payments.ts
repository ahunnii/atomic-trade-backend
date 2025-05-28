import { db } from "~/server/db";

import type { Address as PaymentAddress } from "@atomic-trade/payments";
import type { Address } from "@prisma/client";
import { paymentService } from "@atomic-trade/payments";

export const createPaymentIntent = async ({
  sessionId,
  orderId,
}: {
  sessionId: string;
  orderId: string;
}) => {
  // First get the checkout session to extract the payment_intent ID

  const checkoutSessionData = await paymentService.checkout.getCheckoutSession({
    sessionId,
  });

  if (!checkoutSessionData.intentId) {
    throw new Error("No payment intent found in checkout session");
  }

  const { amountPaid, intentId } =
    await paymentService.transaction.getPaymentIntent({
      paymentIntentId: checkoutSessionData.intentId ?? "",
    });

  await db.payment.create({
    data: {
      orderId,
      amountInCents: amountPaid,
      status: "PAID",
      method: "STRIPE",
      metadata: { paymentIntentId: intentId },
    },
  });

  return intentId;
};

export const getOrCreateAddress = async ({
  customerAddresses,
  address,
  customerName,
  customerId,
  customerPhone,
}: {
  customerAddresses: Address[];
  address: PaymentAddress | null;
  customerName: string;
  customerId: string;
  customerPhone?: string;
}) => {
  if (!address) return null;

  const existingAddress = customerAddresses.find(
    (a) =>
      a.street === address.street &&
      a.additional === address.additional &&
      a.city === address.city &&
      a.state === address.state &&
      a.postalCode === address.postalCode &&
      a.country === address.country &&
      a.firstName === customerName.split(" ")[0] &&
      a.lastName === customerName.split(" ")[1],
  );

  if (existingAddress) return existingAddress;

  const newAddress = await db.address.create({
    data: {
      customerId,
      formatted: `${address?.street}${address?.additional ? ` ${address?.additional}` : ""}, ${address?.city}, ${address?.state} ${address?.postalCode}, ${address?.country}`,
      city: address?.city ?? "",
      state: address?.state ?? "",
      country: address?.country ?? "",
      postalCode: address?.postalCode ?? "",
      isDefault: false,
      street: address?.street ?? "",
      additional: address?.additional ?? "",
      firstName: customerName?.split(" ")[0] ?? "",
      lastName: customerName?.split(" ")[1] ?? "",
      phone: customerPhone ?? null,
    },
  });

  return newAddress;
};

export const getOrCreateCustomer = async ({
  email,
  customerName,
  address,
  storeId,
}: {
  storeId: string;
  email: string;
  customerName: string;
  address: Partial<Address> | null;
}) => {
  const customer = await db.customer.findFirst({
    where: { email },
    include: { addresses: true },
  });

  if (customer) return customer;

  const processorCustomerMetadata = await paymentService.createCustomer({
    email,
    name: customerName,
    address: address as Address | null,
  });

  const dbCustomer = await db.customer.create({
    data: {
      email,
      firstName: customerName.split(" ")[0] ?? "",
      lastName: customerName.split(" ")[1] ?? "",
      storeId: storeId,
      metadata: { ...processorCustomerMetadata },
    },
  });

  if (address) {
    await db.address.create({
      data: {
        customerId: dbCustomer.id,
        formatted: `${address?.street}${address?.additional ? ` ${address?.additional}` : ""}, ${address?.city}, ${address?.state} ${address?.postalCode}, ${address?.country}`,
        city: address?.city ?? "",
        state: address?.state ?? "",
        country: address?.country ?? "",
        postalCode: address?.postalCode ?? "",
        isDefault: true,
        street: address?.street ?? "",
        additional: address?.additional ?? "",
        firstName: customerName?.split(" ")[0] ?? "",
        lastName: customerName?.split(" ")[1] ?? "",
      },
    });
  }

  const createdCustomer = await db.customer.findFirst({
    where: { id: dbCustomer.id },
    include: { addresses: true },
  });

  return createdCustomer;
};
