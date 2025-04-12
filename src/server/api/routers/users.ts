import {
  adminProcedure,
  createTRPCRouter,
  developmentProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

import type { Role } from "@prisma/client";

export const userRouter = createTRPCRouter({
  updateRole: developmentProcedure
    .input(z.enum(["USER", "ADMIN", "BUSINESS_OWNER"]))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { role: input as Role },
      });

      return {
        data: user,
        message: "User role updated successfully",
      };
    }),

  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany({
      include: { addresses: true },
    });
  }),

  getByEmail: adminProcedure
    .input(z.string())
    .query(({ ctx, input: email }) => {
      return ctx.db.user.findUnique({
        where: { email },
        include: { addresses: true },
      });
    }),

  getAllCustomers: adminProcedure
    .input(z.string())
    .query(({ ctx, input: storeId }) => {
      return ctx.db.customer.findMany({
        where: { storeId },
        include: { addresses: true },
      });
    }),

  getSession: protectedProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
});
