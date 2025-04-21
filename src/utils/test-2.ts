// Types
export type CartItem = {
  variantId: string;
  quantity: number;
  priceInCents: number;
};

// Helpers
export function isDiscountActive(discount: Discount, now: Date): boolean {
  return (
    discount.isActive &&
    now >= new Date(discount.startsAt) &&
    (!discount.endsAt || now <= new Date(discount.endsAt))
  );
}

export function isDiscountValidForCustomer(
  discount: Discount,
  customerId?: string,
): boolean {
  if (!customerId || discount.customers.length === 0) return true;
  return discount.customers.some((c) => c.id === customerId);
}

export function isDiscountWithinUsageLimits(discount: Discount): boolean {
  return (
    discount.maximumUses == null || (discount.uses ?? 0) < discount.maximumUses
  );
}

export function discountAppliesToVariant(
  discount: Discount,
  variantId: string,
  collections: Collection[],
): boolean {
  const variantIds = discount.variants.map((v) => v.id);
  if (variantIds.includes(variantId)) return true;

  const variantInCollections = collections
    .filter((col) => discount.collections.some((dc) => dc.id === col.id))
    .some((col) =>
      col.products.some((prod) =>
        prod.variants.some((v) => v.id === variantId),
      ),
    );

  return variantInCollections || discount.applyToAllProducts;
}

export function meetsMinimums(
  discount: Discount,
  cartItems: CartItem[],
): boolean {
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.priceInCents * item.quantity,
    0,
  );

  const meetsQty =
    !discount.minimumQuantity || totalQuantity >= discount.minimumQuantity;
  const meetsPurchase =
    !discount.minimumPurchaseInCents ||
    subtotal >= discount.minimumPurchaseInCents;

  return meetsQty && meetsPurchase;
}

export function isCombinable(
  discount: Discount,
  appliedDiscounts: Discount[],
): boolean {
  if (discount.canCombineWithOtherDiscounts) return true;
  return appliedDiscounts.length === 0;
}

export function getApplicableDiscounts(
  discounts: Discount[],
  cartItems: CartItem[],
  collections: Collection[],
  customerId?: string,
  now = new Date(),
): Discount[] {
  const validDiscounts: Discount[] = [];

  for (const discount of discounts) {
    const meetsAllCriteria =
      isDiscountActive(discount, now) &&
      isDiscountValidForCustomer(discount, customerId) &&
      isDiscountWithinUsageLimits(discount) &&
      meetsMinimums(discount, cartItems);

    if (!meetsAllCriteria) continue;

    if (isCombinable(discount, validDiscounts)) {
      validDiscounts.push(discount);
    }
  }

  return validDiscounts;
}

export function applyBestProductDiscounts(
  cartItems: CartItem[],
  discounts: Discount[],
  collections: Collection[],
): CartItem[] {
  return cartItems.map((item) => {
    const productDiscounts = discounts.filter(
      (d) =>
        d.type === "PRODUCT" &&
        discountAppliesToVariant(d, item.variantId, collections),
    );

    let bestPrice = item.priceInCents;

    for (const discount of productDiscounts) {
      const discountedPrice =
        discount.amountType === "PERCENTAGE"
          ? item.priceInCents * (1 - discount.amount / 100)
          : item.priceInCents - discount.amount;

      bestPrice = Math.min(bestPrice, Math.max(discountedPrice, 0));
    }

    return { ...item, priceInCents: Math.round(bestPrice) };
  });
}

export function applyOrderDiscount(
  cartTotal: number,
  discounts: Discount[],
): number {
  const orderDiscounts = discounts.filter(
    (d) => d.type === "ORDER" && d.applyToOrder,
  );
  let bestDiscount = 0;

  for (const discount of orderDiscounts) {
    const value =
      discount.amountType === "PERCENTAGE"
        ? cartTotal * (discount.amount / 100)
        : discount.amount;
    bestDiscount = Math.max(bestDiscount, value);
  }

  return Math.round(bestDiscount);
}

export function applyShippingDiscount(
  shippingCost: number,
  discounts: Discount[],
): number {
  const shippingDiscounts = discounts.filter(
    (d) => d.type === "SHIPPING" && d.applyToShipping,
  );
  return shippingDiscounts.length > 0 ? 0 : shippingCost;
}

// Main entry point
export function calculateCartDiscounts({
  cartItems,
  discounts,
  collections,
  shippingCost,
  customerId,
  now = new Date(),
}: {
  cartItems: CartItem[];
  discounts: Discount[];
  collections: Collection[];
  shippingCost: number;
  customerId?: string;
  now?: Date;
}) {
  const validDiscounts = getApplicableDiscounts(
    discounts,
    cartItems,
    collections,
    customerId,
    now,
  );

  const updatedCartItems = applyBestProductDiscounts(
    cartItems,
    validDiscounts,
    collections,
  );
  const subtotal = updatedCartItems.reduce(
    (sum, i) => sum + i.priceInCents * i.quantity,
    0,
  );

  const orderDiscountInCents = applyOrderDiscount(subtotal, validDiscounts);
  const discountedShipping = applyShippingDiscount(
    shippingCost,
    validDiscounts,
  );

  const totalAfterDiscounts =
    subtotal - orderDiscountInCents + discountedShipping;

  return {
    updatedCartItems,
    discountedShipping,
    orderDiscountInCents,
    totalAfterDiscounts: Math.max(totalAfterDiscounts, 0),
  };
}
