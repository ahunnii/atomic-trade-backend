import type Stripe from "stripe";

import { env } from "~/env";

import { stripeClient } from "../clients/stripe";

type Props = {
  cartId: string;
  cartItems: {
    id: string;
    variant?: {
      id: string;
      name: string;
      priceInCents: number;
      compareAtPriceInCents?: number | null;
      product: { featuredImage: string; id: string; name: string };
    } | null;

    quantity: number;
    appliedDiscounts?:
      | {
          id: string;
          code: string;
          type: "PRODUCT" | "ORDER" | "SHIPPING";
        }[]
      | null;
  }[];
};
export async function cartToLineItems({ cartId, cartItems }: Props) {
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const products: Stripe.Product[] = [];

  await Promise.all(
    cartItems.map(async (item) => {
      const product = await stripeClient.products.create({
        name: item?.variant?.product?.name ?? "Custom Product",
        description: item?.variant?.name ?? "",
        images: [
          item?.variant?.product?.featuredImage ??
            `${env.NEXT_PUBLIC_STORAGE_URL}/misc/placeholder-image.webp`,
        ],
        metadata: {
          productId: item?.variant?.product?.id ?? "",
          variantId: item?.variant?.id ?? "",
          cartItemId: item?.id ?? "",
          cartId: cartId ?? "",
        },
      });

      products.push(product);

      const price = await stripeClient.prices.create({
        product: product.id,
        unit_amount: item?.variant?.priceInCents,
        currency: "usd",
      });

      line_items.push({
        price: price.id,
        quantity: item.quantity,
      });
    }),
  );

  return { line_items, products };
}
