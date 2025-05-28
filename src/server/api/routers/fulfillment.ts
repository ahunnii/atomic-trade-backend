import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { z } from "zod";

import { emailService } from "@atomic-trade/email";

import { OrderFulfillmentStatus } from "~/types/order";
import { env } from "~/env";
import { GenericOrderUpdateEmail } from "~/lib/email-templates/generic-order-update-email";

export const fulfillmentRouter = createTRPCRouter({
  markAsFulfilled: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: orderId }) => {
      const order = await ctx.db.order.update({
        where: { id: orderId },
        data: {
          fulfillmentStatus: OrderFulfillmentStatus.FULFILLED,
        },
        include: { store: { select: { name: true, logo: true } } },
      });
      await ctx.db.orderItem.updateMany({
        where: { orderId },
        data: { isFulfilled: true },
      });

      const fromEmail = `${order.store.name} <support@dreamwalkerstudios.co>`;

      const logo = `${env.NEXT_PUBLIC_STORAGE_URL}/misc/${order.store.logo}`;

      if (order.email) {
        await emailService.sendEmail({
          from: fromEmail,
          to: "ahunn@umich.edu",
          subject: "Your order has been marked as fulfilled",
          template: GenericOrderUpdateEmail,
          data: {
            storeName: order.store.name,
            message: "Your order has been marked as fulfilled",
            email: "ahunn@umich.edu",
            logo,
          },
        });
      }

      return {
        data: order,
        message: "Order marked as fulfilled successfully",
      };
    }),
});
