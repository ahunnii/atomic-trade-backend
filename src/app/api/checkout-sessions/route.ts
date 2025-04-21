import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { CheckoutData } from "~/lib/payments/types";
import { paymentService } from "~/lib/payments";

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerId, couponCode, returnUrl, successUrl } =
      (await request.json()) as CheckoutData;

    const session = await paymentService.createCheckoutSession({
      orderId,
      customerId,
      couponCode,
      returnUrl,
      successUrl,
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
