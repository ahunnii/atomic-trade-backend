"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import type { Order } from "~/types/order";
import { api } from "~/trpc/react";
import { useDefaultMutationActions } from "~/hooks/use-default-mutation-actions";
import { FormCardSection } from "~/components/shared/form-card-section";
import { AdvancedDataTable } from "~/components/shared/tables/advanced-data-table";
import { ContentLayout } from "~/app/[storeSlug]/_components/content-layout";

import { CreateCheckoutSession } from "./create-checkout-session";
import { CreateInvoice } from "./create-invoice";
import { CreatePaymentLink } from "./create-payment-link";

type Props = { storeId: string; storeSlug: string };

export const CheckoutSessionClient = ({ storeId, storeSlug }: Props) => {
  const storeOrders = api.order.getAll.useQuery(storeId);

  return (
    <div className="space-y-4 py-4">
      <FormCardSection title="Checkout Session via Order">
        <CreateCheckoutSession
          orders={(storeOrders?.data as unknown as Order[]) ?? []}
        />
      </FormCardSection>

      <FormCardSection title="Checkout via Payment Link">
        <CreatePaymentLink storeId={storeId} storeSlug={storeSlug} />
      </FormCardSection>
      <FormCardSection title="Create Invoice">
        <CreateInvoice storeId={storeId} storeSlug={storeSlug} />
      </FormCardSection>
    </div>
  );
};
