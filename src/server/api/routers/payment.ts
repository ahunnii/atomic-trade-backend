import type Stripe from "stripe";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { calculateCartDiscounts } from "~/utils/calculate-cart-discounts";
import { z } from "zod";

import { env } from "~/env";
import { paymentService } from "~/lib/payments";
import { stripeClient } from "~/lib/payments/clients/stripe";

export const paymentRouter = createTRPCRouter({
  checkout: publicProcedure
    .input(
      z.object({
        cartId: z.string(),
        couponCode: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input: { cartId, couponCode } }) => {
      // const cart = await ctx.db.cart.findUnique({
      //   where: { id: cartId },
      //   include: {
      //     cartItems: { include: { variant: { include: { product: true } } } },
      //     store: {
      //       include: {
      //         discounts: {
      //           include: { collections: true, variants: true, customers: true },
      //         },
      //         collections: {
      //           include: { products: { include: { variants: true } } },
      //         },
      //       },
      //     },
      //   },
      // });

      // const variants = await ctx.db.variation.findMany({
      //   where: { product: { storeId: cart?.storeId } },
      //   include: { product: true },
      // });

      // const couponDiscount = couponCode
      //   ? await ctx.db.discount.findFirst({
      //       where: { storeId: cart?.storeId, code: couponCode },
      //       include: { collections: true, variants: true, customers: true },
      //     })
      //   : null;

      // const data = calculateCartDiscounts({
      //   cartItems: cart?.cartItems ?? [],
      //   discounts: cart?.store?.discounts ?? [],
      //   collections: cart?.store?.collections ?? [],
      //   variants: variants.map((v) => ({
      //     variantId: v.id,
      //     priceInCents: v.priceInCents,
      //     compareAtPriceInCents: v.compareAtPriceInCents,
      //   })),
      //   shippingCost: cart?.store?.flatRateAmount ?? 0,
      //   customerId: cart?.customerId ?? undefined,
      //   couponDiscount: couponDiscount ?? undefined,
      // });

      const paymentSession = await paymentService.createCheckoutSession({
        returnUrl: `${env.NEXT_PUBLIC_HOSTNAME}/dreamwalker-studios/settings/payments/checkout?canceled=true`,
        successUrl: `${env.NEXT_PUBLIC_HOSTNAME}/dreamwalker-studios/settings/payments/checkout?session_id={CHECKOUT_SESSION_ID}`,
        cartId,
        couponCode,
      });

      return {
        data: paymentSession,
        message: "Checkout session created successfully",
      };
    }),

  createCheckoutSession: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: orderId }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: orderId },
        include: {
          store: true,
        },
      });

      const paymentSession = await paymentService.createCheckoutSession({
        returnUrl: `${env.NEXT_PUBLIC_HOSTNAME}/dreamwalker-studios/settings/payments/checkout?canceled=true`,
        successUrl: `${env.NEXT_PUBLIC_HOSTNAME}/dreamwalker-studios/settings/payments/checkout?session_id={CHECKOUT_SESSION_ID}`,
        orderId,
        storeId: order?.storeId,
      });

      return {
        data: paymentSession,
        message: "Checkout session created successfully",
      };
    }),

  updateOrderFromCheckoutSession: publicProcedure
    .input(z.any())
    .mutation(async ({ ctx, input: session }) => {
      const checkoutSession = session as Stripe.Checkout.Session;

      console.log("checkoutSession", checkoutSession);

      const customerEmail = checkoutSession?.customer_details?.email;
      const customerDetails = checkoutSession?.customer_details;
      const orderId = checkoutSession?.metadata?.orderId;

      if (customerEmail) {
        const customer = await ctx.db.customer.findUnique({
          where: { email: customerEmail },
          include: { addresses: true },
        });

        if (!customer) {
          const stripeCustomer = await stripeClient.customers.create({
            email: customerEmail,

            name: customerDetails?.name ?? "",
            address: {
              line1: customerDetails?.address?.line1 ?? "",
              line2: customerDetails?.address?.line2 ?? "",
              city: customerDetails?.address?.city ?? "",
              state: customerDetails?.address?.state ?? "",
              postal_code: customerDetails?.address?.postal_code ?? "",
              country: customerDetails?.address?.country ?? "",
            },
          });

          const dbCustomer = await ctx.db.customer.create({
            data: {
              email: customerEmail,
              firstName: customerDetails?.name?.split(" ")[0] ?? "",
              lastName: customerDetails?.name?.split(" ")[1] ?? "",
              storeId: checkoutSession.metadata?.storeId ?? "",
              metadata: {
                stripeCustomerId: stripeCustomer.id,
              },
            },
          });

          await ctx.db.address.create({
            data: {
              customerId: dbCustomer.id,
              formatted: `${customerDetails?.address?.line1}${customerDetails?.address?.line2 ? ` ${customerDetails?.address?.line2}` : ""}, ${customerDetails?.address?.city}, ${customerDetails?.address?.state} ${customerDetails?.address?.postal_code}, ${customerDetails?.address?.country}`,
              city: customerDetails?.address?.city ?? "",
              state: customerDetails?.address?.state ?? "",
              country: customerDetails?.address?.country ?? "",
              postalCode: customerDetails?.address?.postal_code ?? "",
              isDefault: true,
              street: customerDetails?.address?.line1 ?? "",
              firstName: customerDetails?.name?.split(" ")[0] ?? "",
              lastName: customerDetails?.name?.split(" ")[1] ?? "",
            },
          });
        }
        if (customer) {
          // Check if the customer already has this address
          const formattedAddress = `${customerDetails?.address?.line1}${customerDetails?.address?.line2 ? ` ${customerDetails?.address?.line2}` : ""}, ${customerDetails?.address?.city}, ${customerDetails?.address?.state} ${customerDetails?.address?.postal_code}, ${customerDetails?.address?.country}`;

          const addressExists = customer.addresses.some(
            (address) => address.formatted === formattedAddress,
          );

          // If the address doesn't exist, create it
          if (!addressExists && customerDetails?.address) {
            await ctx.db.address.create({
              data: {
                customerId: customer.id,
                firstName: customerDetails.name?.split(" ")[0] ?? "",
                lastName: customerDetails.name?.split(" ")[1] ?? "",
                formatted: formattedAddress,
                city: customerDetails.address.city ?? "",
                state: customerDetails.address.state ?? "",
                country: customerDetails.address.country ?? "",
                postalCode: customerDetails.address.postal_code ?? "",
                isDefault: false, // Not setting as default since customer already has addresses
                street: customerDetails.address.line1 ?? "",
                additional: customerDetails.address.line2 ?? "",
              },
            });
          }

          // await ctx.db.order.update({
          //   where: { id: checkoutSession.metadata?.orderId },
          //   data: { customerId: customer.id },
          // });
        }
      }

      if (checkoutSession.payment_intent && orderId) {
        const paymentIntent = await stripeClient.paymentIntents.retrieve(
          checkoutSession.payment_intent as string,
        );

        console.log("paymentIntent", paymentIntent);

        if (paymentIntent.metadata?.orderId) {
          await ctx.db.payment.create({
            data: {
              orderId,
              amountInCents: paymentIntent.amount,
              status: "PAID",
              method: "STRIPE",
              metadata: { paymentIntentId: paymentIntent.id },
            },
          });
        }
      }
      return {
        data: checkoutSession,
        message: "Checkout session updated successfully",
      };
    }),

  createPaymentLink: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            name: z.string(),
            amountInCents: z.number(),
            quantity: z.number(),
            variantId: z.string().optional(),
          }),
        ),
        storeId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const paymentLink = await paymentService.createPaymentLink(input);

      return {
        data: paymentLink,
        message: "Payment link created successfully",
      };
    }),

  createInvoice: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            name: z.string(),
            amountInCents: z.number(),
            quantity: z.number(),
            variantId: z.string().optional(),
            productRequestId: z.string().optional(),
          }),
        ),
        email: z.string(),
        orderId: z.string(),
        storeId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const invoice = await paymentService.createInvoice(input);

      return {
        data: invoice,
        message: "Invoice created successfully",
      };
    }),
});
