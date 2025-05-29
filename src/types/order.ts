import type {
  Address,
  Customer,
  Fulfillment,
  Order,
  OrderItem,
  Package,
  PackageItem,
  Payment,
  Product,
  Refund,
  TimelineEvent,
  Variation,
} from "@prisma/client";

export type OrderWithOrderItems = Order & {
  shippingAddress?: Address | null;
  billingAddress?: Address | null;
  fulfillment?:
    | (Fulfillment & {
        packages?: Package[] | null;
      })
    | null;
  customer?:
    | (Customer & { addresses?: Address[]; _count?: { orders: number } })
    | null;
  orderItems: (OrderItem & {
    variant?:
      | (Variation & {
          product?: Product;
        })
      | null;
  })[];
  timeline?: TimelineEvent[];
  payments?: PaymentWithRefunds[];
};

export type AllOrderWithOrderItems = Order & {
  shippingAddress?:
    | Address
    | {
        city: string;
        state: string;
      }
    | null;
  billingAddress?:
    | Address
    | {
        city: string;
        state: string;
      }
    | null;
  fulfillment?:
    | (Fulfillment & {
        packages?: Package[] | null;
      })
    | null;
  customer?:
    | (Customer & { addresses?: Address[]; _count?: { orders: number } })
    | null;
  orderItems: (OrderItem & {
    variant?:
      | (Variation & {
          product?: Product;
        })
      | null;
  })[];
  timeline?: TimelineEvent[];
  payments?: PaymentWithRefunds[];
};

export type PaymentWithRefunds = Payment & {
  refunds: Refund[];
};
export type OrderWithOrderItemsAndTimeline = OrderWithOrderItems & {
  timeline: TimelineEvent[];
};

export type FulfillmentWithPackages = Fulfillment & {
  packages: (Package & {
    items: PackageItem[];
  })[];
};
