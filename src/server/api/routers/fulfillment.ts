import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

import { OrderFulfillmentStatus } from "~/types/order";
import { emailService } from "~/lib/email";
import { GenericOrderUpdateEmail } from "~/lib/email/email-templates/orders/generic-order-update-email";

export const fulfillmentRouter = createTRPCRouter({
  markAsFulfilled: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: orderId }) => {
      const order = await ctx.db.order.update({
        where: { id: orderId },
        data: {
          fulfillmentStatus: OrderFulfillmentStatus.FULFILLED,
        },
        include: { store: { select: { name: true } } },
      });
      await ctx.db.orderItem.updateMany({
        where: { orderId },
        data: { isFulfilled: true },
      });

      const fromEmail = `${order.store.name} <support@dreamwalkerstudios.co>`;

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
          },
        });
      }

      return {
        data: order,
        message: "Order marked as fulfilled successfully",
      };
    }),
});
