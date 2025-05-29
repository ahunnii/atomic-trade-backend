import { getStoreIdViaTRPC } from "~/server/actions/store";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { z } from "zod";

export const cartsRouter = createTRPCRouter({
  getAll: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input: storeSlug }) => {
      const storeId = await getStoreIdViaTRPC(storeSlug);

      const carts = await ctx.db.cart.findMany({
        where: { storeId },
        include: { cartItems: true, customer: true },
        orderBy: { createdAt: "desc" },
      });

      return carts;
    }),

  get: adminProcedure.input(z.string()).query(({ ctx, input: cartId }) => {
    return ctx.db.cart.findUnique({
      where: { id: cartId },
      include: { cartItems: true },
    });
  }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: cartId }) => {
      const cart = await ctx.db.cart.delete({
        where: { id: cartId },
      });

      return {
        data: cart,
        message: "Cart deleted successfully",
      };
    }),
});
