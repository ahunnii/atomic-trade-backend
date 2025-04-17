import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";

import { DiscountAmountType } from "~/types/discount";
import { collectionFormValidator } from "~/lib/validators/collection";
import { discountFormValidator } from "~/lib/validators/discount";

export const discountRouter = createTRPCRouter({
  getAll: adminProcedure.input(z.string()).query(({ ctx, input: storeId }) => {
    return ctx.db.discount.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });
  }),

  get: adminProcedure.input(z.string()).query(({ ctx, input: discountId }) => {
    return ctx.db.discount.findUnique({
      where: { id: discountId },
      include: {
        variants: true,
        collections: true,
        customers: true,
      },
    });
  }),

  create: adminProcedure
    .input(
      discountFormValidator
        .omit({
          maximumRequirementType: true,
          minimumRequirementType: true,
          shippingCountryRequirementType: true,
        })
        .extend({ storeId: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      const { storeId, variants, collections, customers, ...rest } = input;
      const discount = await ctx.db.discount.create({
        data: {
          ...rest,
          amount:
            rest.amountType === DiscountAmountType.PERCENTAGE
              ? Math.min(Math.max(0, rest.amount), 100)
              : Math.abs(rest.amount),
          variants: {
            connect: variants.map((variant) => ({ id: variant.id })),
          },
          collections: {
            connect: collections.map((collection) => ({ id: collection.id })),
          },
          customers: {
            connect: customers.map((customer) => ({ id: customer.id })),
          },

          storeId,
        },
      });

      return {
        data: discount,
        message: "Discount created successfully",
      };
    }),

  update: adminProcedure
    .input(
      discountFormValidator
        .omit({
          maximumRequirementType: true,
          minimumRequirementType: true,
          shippingCountryRequirementType: true,
        })
        .extend({ discountId: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      const { variants, collections, customers, discountId, code, ...rest } =
        input;

      const currentDiscount = await ctx.db.discount.findUnique({
        where: { id: discountId },
        include: {
          variants: true,
          collections: true,
          customers: true,
        },
      });
      const discount = await ctx.db.discount.update({
        where: { id: discountId },
        data: {
          ...rest,
          amount:
            rest.amountType === DiscountAmountType.PERCENTAGE
              ? Math.min(Math.max(0, rest.amount), 100)
              : Math.abs(rest.amount),
          variants: {
            disconnect: currentDiscount?.variants.map((variant) => ({
              id: variant.id,
            })),
            connect: variants.map((variant) => ({ id: variant.id })),
          },
          collections: {
            disconnect: currentDiscount?.collections.map((collection) => ({
              id: collection.id,
            })),
            connect: collections.map((collection) => ({ id: collection.id })),
          },
          customers: {
            disconnect: currentDiscount?.customers.map((customer) => ({
              id: customer.id,
            })),
            connect: customers.map((customer) => ({ id: customer.id })),
          },
        },
      });

      return {
        data: discount,
        message: "Discount updated successfully",
      };
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: discountId }) => {
      const discount = await ctx.db.discount.delete({
        where: { id: discountId },
      });

      return {
        data: discount,
        message: "Discount deleted successfully",
      };
    }),

  duplicate: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: discountId }) => {
      const discount = await ctx.db.discount.findUnique({
        where: { id: discountId },
        include: {
          variants: true,
          collections: true,
          customers: true,
        },
        omit: {
          createdAt: true,
          updatedAt: true,
          id: true,
        },
      });

      if (!discount) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Discount not found",
        });
      }

      const { variants, collections, customers, ...rest } = discount;

      const duplicatedDiscount = await ctx.db.discount.create({
        data: {
          ...rest,
          storeId: discount.storeId,
          code: `${createId()}`,
          isActive: false,
        },
      });

      return {
        data: duplicatedDiscount,
        message: "Discount duplicated successfully",
      };
    }),
});
