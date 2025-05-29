"use client";

import type { CustomerWithOrders } from "~/types/customer";
import type {
  FulfillmentWithPackages,
  OrderWithOrderItems,
} from "~/types/order";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { CustomerSection } from "./customer-section";
import { FulfillmentSection } from "./fulfillment-section";

type Props = {
  orderId: string;
  storeSlug: string;
  order: OrderWithOrderItems;
  areItemsRefundable: boolean;
  areItemsExchangeable: boolean;
  customers: CustomerWithOrders[];
};

export const FulfillmentSingleOrderClient = ({
  order,
  storeSlug,
  customers,
}: Props) => {
  return (
    <ContentLayout
      title={`Order #${order?.orderNumber}`}
      breadcrumbs={[
        {
          label: "Orders",
          href: `/${storeSlug}/orders`,
        },
        {
          label: `Order #${order?.orderNumber}`,
          href: `/${storeSlug}/orders/${order?.id}`,
        },
      ]}
      currentPage="Fulfill Order"
    >
      <section className="form-body mt-4 grid w-full grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="col-span-12 flex w-full flex-col space-y-4 lg:col-span-7">
          <FulfillmentSection
            orderId={order?.id ?? ""}
            orderItems={order?.orderItems ?? []}
            onFulfill={async (data) => {
              console.log(data);
            }}
            initialFulfillment={order?.fulfillment as FulfillmentWithPackages}
            orderNumber={order?.orderNumber ?? ""}
            storeSlug={storeSlug}
          />
        </div>
        <div className="col-span-12 flex w-full flex-col space-y-4 lg:col-span-5">
          <CustomerSection customers={customers ?? []} order={order} />
        </div>
      </section>
    </ContentLayout>
  );
};
