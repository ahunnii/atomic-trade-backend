export function orderToCoupon(props: { id: string; discountInCents: number }) {
  if (props?.discountInCents > 0) {
    return {
      amount_off: props.discountInCents,
      currency: "usd",
      max_redemptions: 1,
      metadata: { orderId: props.id },
    };
  }
  return null;
}
