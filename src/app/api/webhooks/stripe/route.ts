/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

// https://github.com/vercel/nextjs-subscription-payments/blob/main/app/api/webhooks/route.ts

import type Stripe from "stripe";

import { env } from "~/env";
import { stripeClient } from "~/lib/payments/clients/stripe";
import { api } from "~/trpc/server";

const relevantEvents = new Set([
  "product.created",
  "product.updated",
  "product.deleted",
  "price.created",
  "price.updated",
  "price.deleted",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret)
      return new Response("Webhook secret not found.", { status: 400 });
    event = stripeClient.webhooks.constructEvent(
      body,
      sig,
      env.STRIPE_WEBHOOK_SECRET,
    );
    console.log(`🔔  Webhook received: ${event.type}`);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "product.created":
        case "product.updated":
          console.log("product upsert", event.data.object);
          break;
        case "price.created":
        case "price.updated":
          console.log("price upsert", event.data.object);
          break;
        case "price.deleted":
          console.log("price delete", event.data.object);
          break;
        case "product.deleted":
          console.log("product delete", event.data.object);
          break;
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          console.log("subscription", event.data.object);

          break;
        case "checkout.session.completed":
          const checkoutSession = event.data.object;
          if (checkoutSession.mode === "subscription") {
            const subscriptionId = checkoutSession.subscription;
            console.log("subscription", subscriptionId);
            // await manageSubscriptionStatusChange(
            //   subscriptionId as string,
            //   checkoutSession.customer as string,
            //   true,
            // );
          }
          if (checkoutSession.mode === "payment") {
            await api.payment.updateOrderFromCheckoutSession(checkoutSession);
          }
          break;
        default:
          throw new Error("Unhandled relevant event!");
      }
    } catch (error) {
      console.log(error);
      return new Response(
        "Webhook handler failed. View your Next.js function logs.",
        {
          status: 400,
        },
      );
    }
  } else {
    return new Response(`Unsupported event type: ${event.type}`, {
      status: 400,
    });
  }
  return new Response(JSON.stringify({ received: true }));
}
