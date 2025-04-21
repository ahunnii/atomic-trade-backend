// import { paymentProcessor } from "~/lib/payment";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { customerValidator } from "~/lib/validators/customer";

export const customersRouter = createTRPCRouter({
  getAll: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input: storeId }) => {
      return ctx.db.customer.findMany({
        where: { storeId },
        include: {
          orders: true,
          _count: { select: { orders: true } },
          addresses: {
            where: { isDefault: true },
          },
        },
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
          _count: {
            select: {
              orders: true,
            },
          },
          orders: {
            include: {
              orderItems: true,
            },
          },
        },
      });

      if (
        customer?.userId !== ctx.session.user.id &&
        ctx.session?.user?.role !== "ADMIN"
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to access this customer",
        });
      }
      return customer;
    }),

  create: adminProcedure
    .input(
      customerValidator.omit({ metadata: true }).extend({
        storeId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { address, tags, ...rest } = input;
      const customer = await ctx.db.customer.create({
        data: {
          ...rest,
          storeId: input.storeId,
          tags: tags.map((tag) => tag.text),
          addresses: {
            create: {
              ...address,
              isDefault: true,
            },
          },
        },
      });

      return {
        data: customer,
        message: "Customer created successfully",
      };
    }),

  update: adminProcedure
    .input(
      customerValidator.omit({ metadata: true }).extend({
        customerId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { customerId, tags, address, ...rest } = input;
      const customer = await ctx.db.customer.update({
        where: { id: customerId },
        include: {
          addresses: {
            where: { isDefault: true },
          },
        },
        data: {
          ...rest,
          tags: tags.map((tag) => tag.text),
        },
      });

      if (customer.addresses[0]) {
        await ctx.db.address.update({
          where: { id: customer.addresses[0].id },
          data: address,
        });
      }

      return {
        data: customer,
        message: "Customer updated successfully",
      };
    }),
  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: customerId }) => {
      const customer = await ctx.db.customer.delete({
        where: { id: customerId },
      });
      return {
        data: customer,
        message: "Customer deleted successfully",
      };
    }),

  // getExternal: adminProcedure.query(async ({}) => {
  //   const customers = await paymentProcessor.getCustomers();
  //   return customers;
  // }),
});
