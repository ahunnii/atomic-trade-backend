// Types
export type CartItem = {
  variantId: string;
  quantity: number;
  priceInCents: number;
};

export type Discount = {
  id: string;
  code: string;
  type: "PRODUCT" | "ORDER" | "SHIPPING";
  amountType: "PERCENTAGE" | "FIXED";
  amount: number;
  isActive: boolean;
  startsAt: Date;
  endsAt?: Date;
  combineWithProductDiscounts: boolean;
  combineWithOrderDiscounts: boolean;
  combineWithShippingDiscounts: boolean;
  minimumPurchaseInCents?: number;
  minimumQuantity?: number;
  maximumUses?: number;
  uses?: number;
  customers: { id: string }[];
  variants: { id: string }[];
  collections: { id: string }[];
  applyToAllProducts: boolean;
  applyToOrder: boolean;
  applyToShipping: boolean;
};

export type Collection = {
  id: string;
  products: { variants: { id: string }[] }[];
};

type VariantInfo = {
  variantId: string;
  priceInCents: number;
};

// Helpers
function isDiscountActive(discount: Discount, now: Date): boolean {
  return (
    discount.isActive &&
    now >= new Date(discount.startsAt) &&
    (!discount.endsAt || now <= new Date(discount.endsAt))
  );
}

function isDiscountValidForCustomer(
  discount: Discount,
  customerId?: string,
): boolean {
  if (!customerId || discount.customers.length === 0) return true;
  return discount.customers.some((c) => c.id === customerId);
}

function isDiscountWithinUsageLimits(discount: Discount): boolean {
  return (
    discount.maximumUses == null || (discount.uses ?? 0) < discount.maximumUses
  );
}

function discountAppliesToVariant(
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

function meetsMinimums(
  discount: Discount,
  cartItems: CartItem[],
  collections: Collection[],
): boolean {
  // Check if the discount is a shipping discount

  let applicableItems = cartItems;

  if (discount.type === "PRODUCT") {
    applicableItems = applicableItems.filter((item) =>
      discountAppliesToVariant(discount, item.variantId, collections),
    );
  }

  const totalQuantity = applicableItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const subtotal = applicableItems.reduce(
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

function getApplicableDiscounts(
  discounts: Discount[],
  cartItems: CartItem[],
  collections: Collection[],
  customerId?: string,
  now = new Date(),
) {
  return discounts.filter(
    (discount) =>
      isDiscountActive(discount, now) &&
      isDiscountValidForCustomer(discount, customerId) &&
      isDiscountWithinUsageLimits(discount) &&
      meetsMinimums(discount, cartItems, collections),
  );
}

function applyBestProductDiscounts(
  cartItems: CartItem[],
  variants: VariantInfo[],
  discounts: Discount[],
  collections: Collection[],
) {
  const appliedDiscounts: Discount[] = [];

  const updatedItems = cartItems.map((item) => {
    const variant = variants.find((v) => v.variantId === item.variantId);
    if (!variant) return item;

    const basePrice = variant.priceInCents;

    let bestPrice = basePrice;
    let bestDiscount: Discount | null = null;

    for (const discount of discounts) {
      if (discount.type !== "PRODUCT") continue;
      if (!discountAppliesToVariant(discount, item.variantId, collections))
        continue;

      const discountedPrice =
        discount.amountType === "PERCENTAGE"
          ? basePrice * (1 - discount.amount / 100)
          : basePrice - discount.amount;

      if (Math.max(discountedPrice, 0) < bestPrice) {
        bestPrice = Math.max(discountedPrice, 0);
        bestDiscount = discount;
      }
    }

    if (bestDiscount) {
      appliedDiscounts.push(bestDiscount);
    }

    return {
      ...item,
      priceInCents: Math.round(bestPrice),
    };
  });

  return { updatedItems, appliedDiscounts };
}

function applyOrderDiscount(subtotal: number, discounts: Discount[]) {
  let bestDiscount = 0;
  let appliedDiscount: Discount | undefined;
  let appliedDiscounts: Discount[] = [];
  const values = [];

  for (const discount of discounts) {
    if (discount.type !== "ORDER") continue;

    const value =
      discount.amountType === "PERCENTAGE"
        ? subtotal * (discount.amount / 100)
        : discount.amount;

    //For blocking
    // if (value > bestDiscount) {
    //   bestDiscount = value;
    //   appliedDiscount = discount;
    // }

    // console.log("------------");
    // console.log(discount, value);
    // console.log("------------");

    values.push(value);

    // bestDiscount += value;
    appliedDiscounts.push(discount);
  }

  bestDiscount = values.reduce((acc, curr) => acc + curr, 0);
  console.log("bestDiscount", bestDiscount);
  console.log("bestDiscount subtotal", subtotal);

  return {
    discountAmount: Math.round(bestDiscount),
    appliedDiscounts,
    appliedDiscount: appliedDiscounts[0],
  };
}

function applyShippingDiscount(shippingCost: number, discounts: Discount[]) {
  const shippingDiscount = discounts.find((d) => d.type === "SHIPPING");

  if (shippingDiscount) {
    return { shippingCostAfterDiscount: 0, appliedDiscount: shippingDiscount };
  }
  return { shippingCostAfterDiscount: shippingCost };
}

// Main
export function calculateCartDiscounts({
  cartItems,
  discounts,
  collections,
  variants,
  shippingCost,
  customerId,
  couponDiscount,
  now = new Date(),
}: {
  cartItems: CartItem[];
  discounts: Discount[];
  collections: Collection[];
  variants: VariantInfo[];
  shippingCost: number;
  customerId?: string;
  couponDiscount?: Discount;
  now?: Date;
}) {
  let allDiscounts = [...discounts];
  if (couponDiscount) {
    allDiscounts.push(couponDiscount);
  }

  const validDiscounts = getApplicableDiscounts(
    allDiscounts,
    cartItems,
    collections,
    customerId,
    now,
  );

  const { updatedItems, appliedDiscounts: appliedProductDiscounts } =
    applyBestProductDiscounts(cartItems, variants, validDiscounts, collections);

  const subtotal = updatedItems.reduce(
    (sum, item) => sum + item.priceInCents * item.quantity,
    0,
  );

  const {
    discountAmount: orderDiscountInCents,
    appliedDiscount: appliedOrderDiscount,
    appliedDiscounts: appliedOrderDiscounts,
  } = applyOrderDiscount(subtotal, validDiscounts);

  const {
    shippingCostAfterDiscount: discountedShipping,
    appliedDiscount: appliedShippingDiscount,
  } = applyShippingDiscount(shippingCost, validDiscounts);

  const totalAfterDiscounts =
    subtotal - orderDiscountInCents + discountedShipping;

  const allAppliedDiscounts = [
    ...appliedProductDiscounts,
    ...(appliedOrderDiscounts ? [...appliedOrderDiscounts] : []),
    ...(appliedShippingDiscount ? [appliedShippingDiscount] : []),
  ];

  const originalSubtotal = cartItems.reduce(
    (sum, item) => sum + item.priceInCents * item.quantity,
    0,
  );
  return {
    originalCartItems: cartItems,
    updatedCartItems: updatedItems,
    discountedShipping,
    orderDiscountInCents,
    productDiscountInCents: originalSubtotal - subtotal,
    totalAfterDiscounts: Math.max(totalAfterDiscounts, 0),
    appliedDiscounts: allAppliedDiscounts.map((d) => ({
      id: d.id,
      code: d.code,
      type: d.type,
    })),
  };
}
