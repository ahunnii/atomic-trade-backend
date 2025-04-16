import type { Customer } from "./customer";
import type { Address } from "~/lib/validators/geocoding";

export type Order = {
  id: string;
  storeId: string;
  orderItems: OrderItem[];
  timeline: TimelineEvent[];
  notes: string | null;
  tags: string[];
  payments: Payment[];
  fulfillmentId?: string;
  fulfillment?: Fulfillment;
  paidInFull: boolean;
  paidInFullAt?: Date;
  paymentStatus: OrderPaymentStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  isTaxExempt: boolean;
  orderNumber: string;
  authorizationCode: string;
  status: OrderStatus;
  type: OrderType;
  subtotalInCents: number;
  taxInCents: number;
  shippingInCents: number;
  totalInCents: number;
  discountInCents: number;
  feeInCents: number;
  receiptLink: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  customerId?: string;
  customer?: Customer;
  shippingAddressId?: string;
  shippingAddress?: Address;
  billingAddressId?: string;
  billingAddress?: Address;
  areAddressesSame: boolean;
  metadata?: Record<string, unknown>;
  isRefundable: boolean;
};

export type OrderItem = {
  id: string;
  orderId: string;
  order: Order;
  name: string;
  description?: string;
  quantity: number;
  unitPriceInCents: number;
  discountInCents: number;
  totalPriceInCents: number;
  isPhysical: boolean;
  isTaxable: boolean;
  metadata?: Record<string, unknown>;
  requestItemId?: string;
  packageItems: PackageItem[];
  isFulfilled: boolean;
  quantityFulfilled: number;
  saleId?: string;
  variantId?: string;
  variant?:
    | {
        id: string;
        product?: {
          id: string;
          featuredImage: string;
        };
      }
    | undefined;
};

export type TimelineEvent = {
  id: string;
  title: string;
  isEditable: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  orderId?: string;
};

export enum OrderStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
  PARTIAL_REFUND = "PARTIAL_REFUND",
}

export enum OrderType {
  ONLINE_SHIP = "ONLINE_SHIP",
  ONLINE_PICKUP = "ONLINE_PICKUP",
  IN_PERSON = "IN_PERSON",
  DRAFT = "DRAFT",
  MANUAL_SHIP = "MANUAL_SHIP",
  MANUAL_PICKUP = "MANUAL_PICKUP",
}

export enum OrderPaymentStatus {
  PAID = "PAID",
  PARTIAL_PAYMENT = "PARTIAL_PAYMENT",
  PENDING = "PENDING",
  REFUNDED = "REFUNDED",
  VOIDED = "VOIDED",
  EXPIRED = "EXPIRED",
}

export enum OrderFulfillmentStatus {
  FULFILLED = "FULFILLED",
  IN_PROGRESS = "IN_PROGRESS",
  ON_HOLD = "ON_HOLD",
  PARTIAL_FULFILLMENT = "PARTIAL_FULFILLMENT",
  RESTOCKED = "RESTOCKED",
  PENDING = "PENDING",
}

export enum PaymentMethod {
  CASH = "CASH",
  INVOICE = "INVOICE",
  STRIPE = "STRIPE",
  PAYPAL = "PAYPAL",
  OTHER = "OTHER",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  AUTHORIZED = "AUTHORIZED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  PARTIAL_REFUND = "PARTIAL_REFUND",
  VOIDED = "VOIDED",
  CANCELLED = "CANCELLED",
  DRAFT = "DRAFT",
  MARKED_AS_PAID = "MARKED_AS_PAID",
  OPEN = "OPEN",
}

export type Payment = {
  id: string;
  orderId: string;
  order: Order;
  amountInCents: number;
  status: PaymentStatus;
  method: PaymentMethod;
  customerId?: string;
  customer?: Customer;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
  refunds?: Refund[];
};

export type Refund = {
  id: string;
  paymentId: string;
  payment: Payment;
  amountInCents: number;
  reason: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export enum FulfillmentType {
  MANUAL = "MANUAL",
  EASYPOST = "EASYPOST",
  PICKUP = "PICKUP",
}

export enum FulfillmentStatus {
  PENDING = "PENDING",
  AWAITING_SHIPMENT = "AWAITING_SHIPMENT",
  AWAITING_PICKUP = "AWAITING_PICKUP",
  FULFILLED = "FULFILLED",
  CANCELLED = "CANCELLED",
  RESTOCKED = "RESTOCKED",
  PARTIAL = "PARTIAL",
  DRAFT = "DRAFT",
}

export enum PackageStatus {
  PENDING = "PENDING",
  LABEL_PRINTED = "LABEL_PRINTED",
  LABEL_PURCHASED = "LABEL_PURCHASED",
  ATTEMPTED_DELIVERY = "ATTEMPTED_DELIVERY",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
  CONFIRMED = "CONFIRMED",
  PRE_TRANSIT = "PRE_TRANSIT",
  IN_TRANSIT = "IN_TRANSIT",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  FAILURE = "FAILURE",
  UNKNOWN = "UNKNOWN",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
  HELD = "HELD",
  DELAYED = "DELAYED",
  LOST = "LOST",
  ARRIVED_AT_FACILITY = "ARRIVED_AT_FACILITY",
}

export type Package = {
  id: string;
  fulfillmentId: string;
  fulfillment: Fulfillment;
  status: PackageStatus;
  shippingAddressId?: string;
  shippingAddress?: Address;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  labelUrl?: string;
  costInCents?: number;
  items: PackageItem[];
  createdAt: Date;
  updatedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
};

export type Fulfillment = {
  id: string;
  order?: Order;
  type: FulfillmentType;
  packages: Package[];
  status: FulfillmentStatus;
  timeEstimate?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
};

export type PackageItem = {
  id: string;
  packageId: string;
  package: Package;
  orderItemId: string;
  orderItem: OrderItem;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
};
