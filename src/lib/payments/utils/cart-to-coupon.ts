import type Stripe from "stripe";

import type { Discount } from "~/utils/calculate-cart-discounts";

import { stripeClient } from "../clients/stripe";

export type StripeProduct = {
  id: string;
  metadata: {
    variantId: string;
  };
};

export async function cartToCouponDated(props: {
  id: string;
  stripeProducts: StripeProduct[];
  productDiscounts: Record<
    string,
    {
      discount: Discount;
      products: {
        id: string;
        variantId: string;
        name: string;
        variantName: string;
      }[];
    }
  >;
  orderDiscounts?: Discount[];
  shippingDiscount?: Discount;
}): Promise<Stripe.Checkout.SessionCreateParams.Discount[]> {
  const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];

  // Handle product discounts
  for (const discount of Object.values(props.productDiscounts)) {
    // Find matching stripe products for this discount
    const applicableProductIds = discount.products.map((p) => p.variantId);
    const matchingStripeProducts = props.stripeProducts
      .filter((p) => applicableProductIds.includes(p.metadata.variantId))
      .map((p) => p.id);

    if (matchingStripeProducts.length === 0) continue;

    if (discount.discount.amountType === "FIXED") {
      // Create a fixed amount coupon
      if (discount.discount.amount > 0) {
        const coupon = await stripeClient.coupons.create({
          amount_off: discount.discount.amount,
          currency: "usd",
          applies_to: { products: matchingStripeProducts },
          max_redemptions: 1,
          metadata: {
            cartId: props.id,
            discountType: "PRODUCT",
          },
        });
        discounts.push({ coupon: coupon.id });
      }
    }

    if (discount.discount.amountType === "PERCENTAGE") {
      // Create a percentage coupon
      if (discount.discount.amount > 0) {
        const coupon = await stripeClient.coupons.create({
          percent_off: discount.discount.amount,
          applies_to: { products: matchingStripeProducts },
          max_redemptions: 1,
          metadata: {
            cartId: props.id,
            discountType: "PRODUCT",
          },
        });
        discounts.push({ coupon: coupon.id });
      }
    }
  }

  // Handle order discounts
  if (props.orderDiscounts && props.orderDiscounts.length > 0) {
    for (const discount of props.orderDiscounts) {
      if (discount.amountType === "FIXED") {
        if (discount.amount > 0) {
          const coupon = await stripeClient.coupons.create({
            amount_off: discount.amount,
            currency: "usd",
            // No applies_to field - applies to entire order
            max_redemptions: 1,
            metadata: {
              cartId: props.id,
              discountType: "ORDER",
            },
          });
          discounts.push({ coupon: coupon.id });
        }
      }

      if (discount.amountType === "PERCENTAGE") {
        if (discount.amount > 0) {
          const coupon = await stripeClient.coupons.create({
            percent_off: discount.amount,
            // No applies_to field - applies to entire order
            max_redemptions: 1,
            metadata: {
              cartId: props.id,
              discountType: "ORDER",
            },
          });
          discounts.push({ coupon: coupon.id });
        }
      }
    }
  }

  // Handle shipping discount
  if (props.shippingDiscount) {
    // For shipping discounts, Stripe doesn't have a direct way to discount only shipping
    // You'd usually apply a discount to the shipping line item, but in Stripe Checkout
    // this is handled differently - you'd typically set shipping_cost to 0
    // and handle the logic elsewhere in your app.

    // However, if you need a coupon for tracking purposes:
    const coupon = await stripeClient.coupons.create({
      name: "Free Shipping",
      amount_off: props.shippingDiscount.amount,
      currency: "usd",
      max_redemptions: 1,
      metadata: {
        cartId: props.id,
        discountType: "SHIPPING",
      },
    });
    discounts.push({ coupon: coupon.id });
  }

  return discounts;
}

export async function cartDiscountsToCoupon(props: {
  id: string;
  totalDiscountInCents: number;
  appliedDiscounts: {
    id: string;
    code: string;
    type: "PRODUCT" | "ORDER" | "SHIPPING";
  }[];
}): Promise<Stripe.Checkout.SessionCreateParams.Discount[]> {
  const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];

  if (props.totalDiscountInCents > 0) {
    const discountMetadata = props.appliedDiscounts.reduce(
      (acc, d) => {
        acc[d.type as string] = d.code;
        return acc;
      },
      {} as Record<string, string>,
    );
    const coupon = await stripeClient.coupons.create({
      name: "DISCOUNT",
      amount_off: props.totalDiscountInCents,
      currency: "usd",
      max_redemptions: 1,
      metadata: {
        cartId: props.id,
        ...discountMetadata,
      },
    });
    discounts.push({ coupon: coupon.id });
  }

  return discounts;
}
