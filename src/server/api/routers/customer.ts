import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { paymentProcessor } from "~/lib/payment";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const customersRouter = createTRPCRouter({
  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.db.customer.findMany({
      include: { orders: { include: { orderItems: true } } },
    });
  }),

  get: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input: customerId }) => {
      const customer = await ctx.db.customer.findUnique({
        where: { id: customerId },
        include: {
          addresses: true,
          requests: true,
          invoices: true,
          user: true,
          orders: {
            include: {
              orderItems: true,
            },
          },
        },
      });

      if (
        customer?.userId !== ctx.session.user.id ||
        ctx.session?.user?.role !== "ADMIN"
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to access this customer",
        });
      }
      return customer;
    }),

  getExternal: adminProcedure.query(async ({}) => {
    const customers = await paymentProcessor.getCustomers();
    return customers;
  }),
});
