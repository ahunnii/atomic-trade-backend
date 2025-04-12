export type Order = {
  id: string;
  storeId: string;
  orderItems: OrderItem[];
  notes: Note[];
  payments: Payment[];
  fulfillmentId?: string;
  fulfillment?: Fulfillment;
  paidInFull: boolean;
  paidInFullAt?: Date;
  orderNumber: string;
  authorizationCode: string;
  status: OrderStatus;
  type: OrderType;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  discount: number;
  fee: number;
  receiptLink: string;
  email: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  customerId?: string;
  customer?: Customer;
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
  metadata?: Record<string, unknown>;
  requestItemId?: string;
  packageId?: string;
  saleId?: string;
  variantId?: string;
};

export type Note = {
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

// Referenced types that would be defined elsewhere
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
  amountInCents: number;
  status: PaymentStatus;
  method: PaymentMethod;
  billingAddressId?: string;
  customerId?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
  refunds?: Refund[];
};

export type Refund = {
  id: string;
  paymentId: string;
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
  status: PackageStatus;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  labelUrl?: string;
  costInCents?: number;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
};

export type Fulfillment = {
  id: string;
  shippingAddressId?: string;
  type: FulfillmentType;
  packages: Package[];
  status: FulfillmentStatus;
  timeEstimate?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
};

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  providerId?: string | null;
  provider?: string | null;
  phoneNumber?: string | null;
  userId?: string | null;
  createdAt: Date;
  updatedAt: Date;
};
