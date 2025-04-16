"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import type { Customer } from "~/types/customer";
import type { Order } from "~/types/order";
import { OrderPaymentStatus } from "~/types/order";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { TimelineSection } from "../../_components/timeline-section";
import { CustomerSection } from "./customer-section";
import { FulfillmentSection } from "./fulfillment-section";
import { PaymentsSection } from "./payments-section";

type Props = {
  orderId: string;
  storeSlug: string;
  order: Order;
  areItemsRefundable: boolean;
  areItemsExchangeable: boolean;
  customers: Customer[];
};

export const FulfillmentSingleOrderClient = ({
  order,
  storeSlug,
  customers,
}: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["order"],
  });

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
            initialFulfillment={order?.fulfillment}
            orderNumber={order?.orderNumber ?? ""}
            storeSlug={storeSlug}
          />

          {/* <TimelineSection timeline={order?.timeline ?? []} /> */}
        </div>
        <div className="col-span-12 flex w-full flex-col space-y-4 lg:col-span-5">
          <CustomerSection customers={customers ?? []} order={order} />
        </div>
      </section>
    </ContentLayout>
  );
};
