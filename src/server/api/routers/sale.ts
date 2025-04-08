import { z } from "zod";
import { saleValidator } from "~/lib/validators/sale";

import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const salesRouter = createTRPCRouter({
  getAllValid: publicProcedure
    .input(z.object({ isActive: z.boolean().optional(), storeId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.sale.findMany({
        where: {
          storeId: input.storeId,
          isActive: input.isActive,
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  get: publicProcedure.input(z.string()).query(({ ctx, input: saleId }) => {
    return ctx.db.sale.findUnique({
      where: { id: saleId },
      include: {
        products: true,
        collections: true,
        _count: { select: { orderItems: true } },
      },
    });
  }),

  create: adminProcedure
    .input(saleValidator.extend({ storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { dateRange, ...rest } = input;

      const sale = await ctx.db.sale.create({
        data: {
          ...rest,
          storeId: input.storeId,
          startsAt: dateRange?.from ?? null,
          endsAt: dateRange?.to ?? null,
          products: { connect: input.products },
          collections: { connect: input.collections },
        },
      });

      return {
        data: sale,
        message: "Sale created successfully",
      };
    }),

  update: adminProcedure
    .input(saleValidator.extend({ saleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { saleId, dateRange, ...rest } = input;

      await ctx.db.sale.update({
        where: { id: input.saleId },
        data: {
          products: { set: [] },
          collections: { set: [] },
        },
      });

      const sale = await ctx.db.sale.update({
        where: { id: saleId },
        data: {
          ...rest,

          startsAt: dateRange?.from ?? null,
          endsAt: dateRange?.to ?? null,

          products: {
            connect: rest.products,
          },
          collections: {
            connect: rest.collections,
          },
        },
      });

      return {
        data: sale,
        message: "Sale updated successfully",
      };
    }),

  setIfActive: adminProcedure
    .input(
      z.object({
        saleId: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sale = await ctx.db.sale.update({
        where: { id: input.saleId },
        data: { isActive: input.isActive },
      });

      return {
        data: sale,
        message: "Sale updated successfully",
      };
    }),

  archive: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: saleId }) => {
      const sale = await ctx.db.sale.update({
        where: { id: saleId },
        data: { isActive: false, deletedAt: new Date() },
      });

      return {
        data: sale,
        message: "Sale archived successfully",
      };
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: saleId }) => {
      const sale = await ctx.db.sale.delete({
        where: { id: saleId },
      });

      return {
        data: sale,
        message: "Sale deleted successfully",
      };
    }),
});
