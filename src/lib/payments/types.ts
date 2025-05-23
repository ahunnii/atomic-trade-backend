export type CheckoutData = {
  cartId?: string;
  orderId?: string;
  customerId?: string;
  couponCode?: string;
  returnUrl?: string;
  successUrl?: string;
  storeId?: string;
};

export type PaymentLinkData = {
  items: {
    name: string;
    description?: string;
    amountInCents: number;
    quantity: number;
    variantId?: string;
  }[];
  customerId?: string;
  couponCode?: string;
  returnUrl?: string;
  successUrl?: string;
  storeId?: string;
};

export type InvoiceData = {
  email: string;
  items: {
    name: string;
    description?: string;
    amountInCents: number;
    quantity: number;
    variantId?: string;
    productRequestId?: string;
  }[];
  orderId: string;
  storeId: string;
};

export type CreateProductData = {
  name: string;
  description?: string;
  priceInCents: number;
  compareAtPriceInCents?: number;
  currency: string;
  storeId: string;
  variantId?: string;
  image?: string;
  isActive?: boolean;
};
