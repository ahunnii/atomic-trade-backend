"use client";

import type { Order } from "~/types/order";
import { api } from "~/trpc/react";
import { FormCardSection } from "~/components/shared/form-card-section";

import { TestCartDiscounts } from "./test-cart-discounts";
import { TestDiscounts } from "./test-discounts";
import { TestOrderDiscounts } from "./test-order-discounts";

type Props = { storeId: string; storeSlug: string };

export const DiscountClient = ({ storeId, storeSlug }: Props) => {
  const storeOrders = api.order.getAll.useQuery(storeId);
  const storeCarts = api.cart.getAll.useQuery(storeId);

  return (
    <div className="space-y-4 py-4">
      <FormCardSection title="Checkout Session via Order">
        <TestDiscounts
          orders={(storeOrders?.data as unknown as Order[]) ?? []}
          carts={storeCarts?.data ?? []}
          storeId={storeId}
        />
        <TestCartDiscounts carts={storeCarts?.data ?? []} storeId={storeId} />
        <TestOrderDiscounts
          orders={(storeOrders?.data as unknown as Order[]) ?? []}
          storeId={storeId}
        />
      </FormCardSection>
    </div>
  );
};
