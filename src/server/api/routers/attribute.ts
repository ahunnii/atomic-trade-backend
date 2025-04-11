import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { attributeValidator } from "~/lib/validators/attribute";

export const attributeRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.string())
    .query(({ ctx, input: attributeId }) => {
      return ctx.db.attribute.findUnique({
        where: { id: attributeId },
        include: { product: true },
      });
    }),

  getAll: publicProcedure.input(z.string()).query(({ ctx, input: storeId }) => {
    return ctx.db.attribute.findMany({
      where: { storeId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: adminProcedure
    .input(
      attributeValidator.extend({
        storeId: z.string(),
        productId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { storeId, productId, name, values } = input;

      const attributes = await ctx.db.attribute.create({
        data: {
          storeId,
          name,
          productId,
          values: values.map((val) => val.content).filter((val) => val !== ""),
        },
      });

      return {
        data: attributes,
        message: "Attribute created successfully",
      };
    }),

  update: adminProcedure
    .input(
      attributeValidator.extend({
        attributeId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { attributeId: id, name, values } = input;

      const attribute = await ctx.db.attribute.update({
        where: { id },
        data: {
          name,
          values: values.map((val) => val.content).filter((val) => val !== ""),
        },
      });

      return {
        data: attribute,
        message: "Attribute updated successfully",
      };
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: attributeId }) => {
      const variants = await ctx.db.product.count({
        where: { attributes: { some: { id: attributeId } } },
      });

      if (variants > 0)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Make sure to remove all product variants using this attribute first.",
        });

      const attribute = await ctx.db.attribute.delete({
        where: { id: attributeId },
      });

      return {
        data: attribute,
        message: "Attribute deleted successfully",
      };
    }),
});
