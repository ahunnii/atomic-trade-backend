"use client";

import { OrderPaymentStatus } from "@prisma/client";

import type { CustomerWithOrders } from "~/types/customer";
import type {
  FulfillmentWithPackages,
  OrderWithOrderItems,
} from "~/types/order";

import { TimelineSection } from "../../_components/timeline-section";
import { CustomerSection } from "./customer-section";
import { ItemsFulfilledSection } from "./items-fulfilled-section";
import { PaymentsSection } from "./payments-section";

type Props = {
  orderId: string;
  storeSlug: string;
  order: OrderWithOrderItems;
  areItemsRefundable: boolean;
  areItemsExchangeable: boolean;
  customers: CustomerWithOrders[];
};

export const SingleOrderClient = ({ order, storeSlug, customers }: Props) => {
  return (
    <section className="form-body grid w-full grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="col-span-12 flex w-full flex-col space-y-4 lg:col-span-8">
        <ItemsFulfilledSection
          fulfillment={order?.fulfillment as FulfillmentWithPackages}
          orderItems={order?.orderItems ?? []}
          orderNumber={order?.orderNumber ?? ""}
          storeSlug={storeSlug}
          orderId={order?.id ?? ""}
        />

        <PaymentsSection
          subtotalInCents={order?.subtotalInCents ?? 0}
          taxInCents={order?.taxInCents ?? 0}
          shippingInCents={order?.shippingInCents ?? 0}
          discountInCents={order?.discountInCents ?? 0}
          feeInCents={order?.feeInCents ?? 0}
          totalInCents={order?.totalInCents ?? 0}
          metadata={order?.metadata as Record<string, unknown>}
          paidInFull={order?.paymentStatus === OrderPaymentStatus.PAID}
        />
        <TimelineSection timeline={order?.timeline ?? []} />
      </div>
      <div className="col-span-12 flex w-full flex-col space-y-4 lg:col-span-4">
        <CustomerSection customers={customers} order={order} />
      </div>
    </section>
  );
};
