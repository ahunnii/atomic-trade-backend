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
import { PaymentsSection } from "./payments-section";

type Props = {
  orderId: string;
  storeSlug: string;
  order: Order;
  areItemsRefundable: boolean;
  areItemsExchangeable: boolean;
  customers: Customer[];
};

export const SingleOrderClient = ({ order, storeSlug, customers }: Props) => {
  const router = useRouter();

  const { defaultActions } = useDefaultMutationActions({
    invalidateEntities: ["order"],
  });

  return (
    <ContentLayout title={`Order #${order?.orderNumber}`}>
      <section className="form-body grid w-full grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="col-span-12 flex w-full flex-col space-y-4 lg:col-span-7">
          <PaymentsSection
            subtotalInCents={order?.subtotalInCents ?? 0}
            taxInCents={order?.taxInCents ?? 0}
            shippingInCents={order?.shippingInCents ?? 0}
            discountInCents={order?.discountInCents ?? 0}
            feeInCents={order?.feeInCents ?? 0}
            totalInCents={order?.totalInCents ?? 0}
            metadata={order?.metadata ?? {}}
            paidInFull={order?.paymentStatus === OrderPaymentStatus.PAID}
          />

          <TimelineSection timeline={order?.timeline ?? []} />
        </div>
        <div className="col-span-12 flex w-full flex-col space-y-4 lg:col-span-5">
          <CustomerSection customers={customers ?? []} order={order} />
        </div>
      </section>
    </ContentLayout>
  );
};
