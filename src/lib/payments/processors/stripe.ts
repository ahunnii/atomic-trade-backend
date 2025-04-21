import type { Stripe } from "stripe";
import { db } from "~/server/db";

import type { OrderItem } from "@prisma/client";

import type { PaymentProcessor } from "../payment-processor";
import type { CheckoutData, InvoiceData, PaymentLinkData } from "../types";
import type { Product, Variation } from "~/types/product";
import { env } from "~/env";

import { stripeClient } from "../clients/stripe";
import { orderToCoupon } from "../utils/order-to-coupon";
import { orderToLineItems } from "../utils/order-to-line-items";

const origin =
  env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : env.NEXT_PUBLIC_HOSTNAME;

export class StripePaymentProcessor implements PaymentProcessor {
  async createCheckoutSession(props: CheckoutData) {
    let line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let orderDiscount: Stripe.Checkout.SessionCreateParams.Discount | undefined;

    if (props.orderId) {
      const order = await db.order.findUnique({
        where: { id: props.orderId },
        include: {
          store: true,
          orderItems: {
            include: {
              variant: { include: { product: true } },
            },
          },
        },
      });

      if (order) {
        line_items = orderToLineItems({
          orderId: order.id,
          orderItems: order?.orderItems,
        });

        const couponData = orderToCoupon({
          id: order.id,
          discountInCents: order.discountInCents ?? 0,
        });

        const coupon = couponData
          ? await stripeClient.coupons.create(couponData)
          : null;

        orderDiscount = coupon ? { coupon: coupon.id } : undefined;
      }
    }

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url:
        props.successUrl ??
        `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: props.returnUrl ?? `${origin}/cancel`,
      discounts: orderDiscount ? [orderDiscount] : undefined,
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },
      automatic_tax: { enabled: true },
      metadata: {
        orderId: props?.orderId ?? "",
        storeId: props?.storeId ?? "",
      },
      payment_intent_data: {
        metadata: {
          orderId: props?.orderId ?? "",
          storeId: props?.storeId ?? "",
        },
      },
    });

    return { sessionId: session.id, sessionUrl: session?.url ?? "" };
  }

  async createPaymentLink(props: PaymentLinkData) {
    let line_items: Stripe.PaymentLinkCreateParams.LineItem[] = [];

    if (props.items) {
      line_items = await Promise.all(
        props.items.map(async (item) => {
          let variant: (Variation & { product: Partial<Product> }) | null =
            null;

          if (item.variantId) {
            variant = await db.variation.findUnique({
              where: { id: item.variantId },
              include: { product: true },
            });
          }

          const price = await stripeClient.prices.create({
            unit_amount: item.amountInCents,
            currency: "usd",
            product_data: {
              name: item.name ?? variant?.product?.name ?? "Product",
              metadata: {
                productId: variant?.product?.id ?? "",
                variantId: variant?.id ?? "",
                compareAtPrice: variant?.compareAtPriceInCents ?? "",
                price: variant?.priceInCents ?? "",
              },
            },
          });

          return {
            price: price.id,
            quantity: item.quantity,
          };
        }),
      );
    }

    const session = await stripeClient.paymentLinks.create({
      line_items,
      // automatic_tax: { enabled: true },
      payment_method_types: ["card"],
      currency: "usd",
      after_completion: {
        type: "redirect",
        redirect: {
          url:
            props.successUrl ??
            `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        },
      },
      metadata: {
        storeId: props?.storeId ?? "",
      },
    });

    return { sessionId: session.id, sessionUrl: session?.url ?? "" };
  }

  async createInvoice(props: InvoiceData) {
    let customer = await db.customer.findUnique({
      where: { email: props.email },
    });

    if (!customer) throw new Error("Customer not found");

    const metadata = customer.metadata as Record<string, string> | null;
    let stripeCustomerId = metadata?.stripeCustomerId;

    if (!stripeCustomerId) {
      const stripeCustomer = await stripeClient.customers.create({
        email: props.email,
        description: "Customer to invoice",
      });

      customer = await db.customer.update({
        where: { id: customer.id },
        data: { metadata: { stripeCustomerId: stripeCustomer.id } },
      });

      stripeCustomerId = stripeCustomer.id;
    }

    const invoice = await stripeClient.invoices.create({
      customer: stripeCustomerId,
      collection_method: "send_invoice",
      days_until_due: 30,
      // automatic_tax: { enabled: true },
    });

    await Promise.all(
      props.items.map(async (item) => {
        const product = await stripeClient.products.create({
          name: item.name,
          description: item.description,
          metadata: {
            variantId: item.variantId ?? "",
            productRequestId: item.productRequestId ?? "",
            stripeInvoiceId: invoice.id ?? "",
          },
        });

        const invoiceItem = await stripeClient.invoiceItems.create({
          customer: stripeCustomerId,
          invoice: invoice.id ?? "",
          price_data: {
            currency: "usd",
            product: product.id,
            unit_amount: item.amountInCents,
          },
          quantity: item.quantity,
          metadata: {
            variantId: item.variantId ?? "",
            productRequestId: item.productRequestId ?? "",
          },
        });

        return invoiceItem;
      }),
    );

    const finalizedInvoice = await stripeClient.invoices.finalizeInvoice(
      invoice.id ?? "",
    );

    await stripeClient.invoices.sendInvoice(invoice.id ?? "");

    return {
      invoiceId: finalizedInvoice.id ?? "",
      invoiceUrl: finalizedInvoice?.hosted_invoice_url ?? "",
    };
  }
}
