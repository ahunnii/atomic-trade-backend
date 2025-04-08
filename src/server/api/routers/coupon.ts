import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

import { CouponType } from "@prisma/client";
import { validateTRPCCouponUpdated } from "~/lib/promotions/util/calculate-discounts";
import { cartItemValidator } from "~/lib/validators/cart";
import { couponValidator } from "~/lib/validators/coupon";

export const couponRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ storeId: z.string(), isActive: z.boolean().optional() }))
    .query(({ ctx, input }) => {
      return ctx.db.coupon.findMany({
        where: {
          storeId: input.storeId,
          isActive: input.isActive,
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  get: publicProcedure.input(z.string()).query(({ ctx, input: couponId }) => {
    return ctx.db.coupon.findUnique({
      where: { id: couponId },
      include: {
        product: true,
        collection: true,
        _count: { select: { orders: true } },
      },
    });
  }),

  create: adminProcedure
    .input(couponValidator.extend({ storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const {
          product,
          collection,
          dateRange,
          allProducts,
          minimumSubtotal,
          oncePerOrder,
          ...rest
        } = input;

        const coupon = await ctx.db.coupon.create({
          data: {
            ...rest,
            startsAt: dateRange?.from ?? null,
            endsAt: dateRange?.to ?? null,
            storeId: input.storeId,
          },
        });

        if (allProducts) {
          await ctx.db.coupon.update({
            where: { id: coupon.id },
            data: {
              productId: null,
              collectionId: null,
              minimumSubtotal: null,
              allProducts,
              oncePerOrder,
            },
          });
        } else if (minimumSubtotal) {
          await ctx.db.coupon.update({
            where: { id: coupon.id },
            data: {
              productId: null,
              collectionId: null,
              minimumSubtotal,
              allProducts: false,
              oncePerOrder: false,
            },
          });
        } else if (
          !allProducts &&
          product &&
          product.length > 0 &&
          product[0]?.id
        ) {
          await ctx.db.coupon.update({
            where: { id: coupon.id },
            data: {
              product: { connect: { id: product[0].id } },
              collectionId: undefined,
              minimumSubtotal: undefined,
              allProducts: false,
              oncePerOrder,
            },
          });
        } else if (
          !allProducts &&
          collection &&
          collection.length > 0 &&
          collection[0]?.id
        ) {
          await ctx.db.coupon.update({
            where: { id: coupon.id },
            data: {
              collection: { connect: { id: collection[0].id } },
              productId: undefined,
              minimumSubtotal: undefined,
              allProducts: false,
              oncePerOrder,
            },
          });
        } else if (
          input.discountType === CouponType.BUY_X_GET_Y ||
          input.discountType === CouponType.SALE_PRICE ||
          input.discountType === CouponType.FREE_SHIPPING
        ) {
          await ctx.db.coupon.update({
            where: { id: coupon.id },
            data: { oncePerOrder: false },
          });
        }

        return coupon;
      } catch (e) {
        console.error("Create coupon error:", e);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating coupon",
        });
      }
    }),

  update: adminProcedure
    .input(couponValidator.extend({ couponId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const {
          product,
          collection,
          couponId,
          dateRange,
          allProducts,
          minimumSubtotal,
          oncePerOrder,
          ...rest
        } = input;

        if (allProducts) {
          await ctx.db.coupon.update({
            where: { id: input.couponId },
            data: {
              productId: null,
              collectionId: null,
              minimumSubtotal: null,
              allProducts,
              oncePerOrder,
            },
          });
        } else if (minimumSubtotal) {
          await ctx.db.coupon.update({
            where: { id: input.couponId },
            data: {
              productId: null,
              collectionId: null,
              minimumSubtotal,
              allProducts: false,
              oncePerOrder: false,
            },
          });
        } else if (
          !allProducts &&
          product &&
          product.length > 0 &&
          product[0]?.id
        ) {
          await ctx.db.coupon.update({
            where: { id: input.couponId },
            data: {
              product: { connect: { id: product[0].id } },
              collectionId: undefined,
              minimumSubtotal: undefined,
              allProducts: false,
              oncePerOrder,
            },
          });
        } else if (
          !allProducts &&
          collection &&
          collection.length > 0 &&
          collection[0]?.id
        ) {
          await ctx.db.coupon.update({
            where: { id: input.couponId },
            data: {
              collection: { connect: { id: collection[0].id } },
              productId: undefined,
              minimumSubtotal: undefined,
              allProducts: false,
              oncePerOrder,
            },
          });
        } else if (
          input.discountType === CouponType.BUY_X_GET_Y ||
          input.discountType === CouponType.SALE_PRICE ||
          input.discountType === CouponType.FREE_SHIPPING
        ) {
          await ctx.db.coupon.update({
            where: { id: input.couponId },
            data: {
              oncePerOrder: false,
            },
          });
        }

        return ctx.db.coupon.update({
          where: { id: couponId },
          data: {
            ...rest,
            startsAt: dateRange?.from ?? null,
            endsAt: dateRange?.to ?? null,
          },
        });
      } catch (e) {
        console.error("Update coupon error:", e);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error updating coupon",
        });
      }
    }),

  setIfActive: adminProcedure
    .input(
      z.object({
        couponId: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const coupon = await ctx.db.coupon.update({
        where: { id: input.couponId },
        data: { isActive: input.isActive },
      });

      return {
        data: coupon,
        message: input.isActive
          ? "Coupon is now active"
          : "Coupon is now inactive",
      };
    }),

  archive: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: couponId }) => {
      const coupon = await ctx.db.coupon.update({
        where: { id: couponId },
        data: { isActive: false, deletedAt: new Date() },
      });

      return {
        data: coupon,
        message: "Coupon archived successfully",
      };
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: couponId }) => {
      const coupon = await ctx.db.coupon.delete({
        where: { id: couponId },
      });

      return {
        data: coupon,
        message: "Coupon deleted successfully",
      };
    }),

  calculateValue: publicProcedure
    .input(
      z.object({
        couponCode: z.string(),
        cartItems: z.array(cartItemValidator),
        subtotal: z.number(),
        hasActiveSale: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // try {
      const { couponCode, subtotal, cartItems, hasActiveSale } = input;
      const coupon = await ctx.db.coupon.findUnique({
        where: { code: couponCode },
        include: {
          store: true,
          product: true,
          collection: {
            include: {
              products: true,
            },
          },
        },
      });

      if (!coupon?.useWithSale && hasActiveSale) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Coupon is not allowed to be used along with a sale.",
        });
      }

      const collection = coupon?.collectionId
        ? await ctx.db.collection.findUnique({
            where: { id: coupon?.collectionId },
            include: {
              products: true,
            },
          })
        : null;

      if (!coupon) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Coupon code not found",
        });
      }

      // Check if the coupon is active
      if (
        !coupon.isActive ||
        (coupon.deletedAt && new Date(coupon.deletedAt) <= new Date())
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Coupon is not active",
        });
      }

      // Check if the coupon is within the valid date range
      const now = new Date();
      if (
        (coupon.startsAt && new Date(coupon.startsAt) > now) ??
        (coupon.endsAt && new Date(coupon.endsAt) < now)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Coupon is not valid at this time",
        });
      }

      // Check if the subtotal meets the minimum requirement
      if (coupon.minimumSubtotal && subtotal < coupon.minimumSubtotal) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Minimum subtotal of ${coupon.minimumSubtotal} is required to use this coupon`,
        });
      }

      // Check if the coupon is applicable to the products in the cart
      if (
        coupon.productId &&
        !cartItems.some((item) => item.productId === coupon.productId)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Coupon is not applicable to the products in the cart",
        });
      }

      // Check if the coupon is applicable to the collections in the cart
      if (
        collection &&
        !cartItems.some((item) =>
          collection?.products.map((item) => item.id).includes(item.productId)
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Coupon is not applicable to the collections in the cart",
        });
      }

      return validateTRPCCouponUpdated({
        coupon,
        cartItems,
        hasFlatRate: coupon.store.hasFlatRate,
        hasFreeShipping: coupon.store.hasFreeShipping,
        minFreeShipping: coupon.store?.minFreeShipping,
        flatRateAmount: coupon.store?.flatRateAmount,
      });
    }),
});
