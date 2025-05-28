import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

import type { CheckoutData } from "@atomic-trade/payments";
import { paymentService } from "@atomic-trade/payments";

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerId, couponCode, returnUrl, successUrl } =
      (await request.json()) as CheckoutData;

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        store: true,
        orderItems: { include: { variant: { include: { product: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const session = await paymentService.checkout.createCheckoutSession({
      orderId,
      customerId,
      couponCode,
      returnUrl,
      successUrl,
      order,
    });
    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "POST",
    },
  });
}
