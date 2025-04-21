import { env } from "~/env";

type Props = {
  orderId: string;
  orderItems: {
    id: string;
    name: string;
    description?: string | null;
    variant?: {
      id: string;
      product: { featuredImage: string; id: string };
    } | null;
    totalPriceInCents: number;
    quantity: number;
  }[];
};
export function orderToLineItems({ orderId, orderItems }: Props) {
  return orderItems.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item?.name ?? "Custom Product",
          description: item?.description ?? "",
          images: [
            item?.variant?.product?.featuredImage ??
              `${env.NEXT_PUBLIC_STORAGE_URL}/misc/placeholder-image.webp`,
          ],
          metadata: {
            productId: item?.variant?.product?.id ?? "",
            variantId: item?.variant?.id ?? "",
            orderItemId: item?.id ?? "",
            orderId: orderId ?? "",
          },
        },
        unit_amount: item?.totalPriceInCents,
      },

      quantity: item.quantity,
    };
  });
}
