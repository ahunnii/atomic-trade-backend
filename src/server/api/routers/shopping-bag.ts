import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSales } from "~/lib/promotions/util/calculate-sale";
import { itemSchema, type Item } from "~/providers/cart-provider";

import { env } from "~/env.mjs";
import { paymentProcessor } from "~/lib/payment";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { SaleType, type Sale } from "~/types/sale";

import { couponRouter } from "./coupon";
import { storeRouter } from "./store";

export const shoppingBagRouter = createTRPCRouter({
  getCartSubtotal: publicProcedure
    .input(
      z.array(
        z.object({
          variantId: z.string(),
          quantity: z.number(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const products = await ctx.db.variation.findMany({
        where: { id: { in: input.map((item) => item.variantId) } },
        select: {
          id: true,
          price: true,
        },
      });

      // Calculate total
      const total = input.reduce((acc, item) => {
        const product = products.find((p) => p.id === item.variantId);
        if (product) return acc + product.price * item.quantity;
        return acc;
      }, 0);

      return { total };
    }),

  getVariant: publicProcedure
    .input(
      z.object({
        variantId: z.string(),
        quantity: z.number().nonnegative(),
        cartQuantity: z.number().nonnegative(),
        cartSubtotal: z.number().nonnegative(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const variant = await ctx.db.variation.findUnique({
        where: { id: input.variantId },
        include: {
          product: {
            include: {
              sales: {
                where: {
                  isActive: true,
                  minimumItems: { lte: input.cartQuantity },
                  minimumSubtotal: { lte: input.cartSubtotal },
                  variant: SaleType.STANDARD,
                  OR: [{ endsAt: { gte: new Date() } }, { endsAt: null }],
                },
              },
            },
          },
        },
      });

      if (!variant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variant not found",
        });
      }

      const bestSale = getSales(
        variant.price,
        (variant?.product?.sales as unknown as Sale[]) ?? []
      );

      return {
        image: variant.product?.featuredImage ?? "/placeholder-image.webp",
        id: variant.id,
        variantId: variant.id,
        productId: variant.product?.id,
        saleId: bestSale?.sale?.id ?? null,
        price: variant.price,
        salesPrice: bestSale?.discountTotal ?? null,
        sale: bestSale?.sale?.name ?? null,
        quantity: input.quantity,
        name: variant.product?.name,
        maxQuantity: variant.quantity ?? Infinity,
        variant:
          variant.values?.length > 0 ? variant.values.join(", ") : "Default",
      } as Item;
    }),

  getVariantWithSpecifiedDiscounts: publicProcedure
    .input(
      z.object({
        variantId: z.string(),
        saleId: z.string().optional(),
        quantity: z.number().nonnegative(),
      })
    )
    .query(async ({ ctx, input }) => {
      const variant = await ctx.db.variation.findUnique({
        where: { id: input.variantId },
        include: { product: true },
      });

      if (!variant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variant not found",
        });
      }

      const sale = await ctx.db.sale.findUnique({
        where: { id: input.saleId },
      });

      const bestSale = getSales(variant.price, [sale] as unknown as Sale[]);

      return {
        image: variant.product?.featuredImage ?? "/placeholder-image.webp",
        id: variant.id,
        variantId: variant.id,
        productId: variant.product?.id,
        saleId: bestSale?.sale?.id ?? null,
        price: variant.price,
        salesPrice: bestSale?.discountTotal ?? null,
        sale: bestSale?.sale?.name ?? null,
        quantity: input.quantity,
        name: variant.product?.name,
        maxQuantity: variant.quantity ?? Infinity,
        variant:
          variant.values?.length > 0 ? variant.values.join(", ") : "Default",
      } as Item;
    }),

  getOrderItemDetails: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            variantId: z.string(),
            saleId: z.string().optional().nullish(),
            quantity: z.number().nonnegative(),
          })
        ),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await Promise.all(
        input.items?.map(async (item) => {
          const variant: Item = await shoppingBagRouter
            .createCaller(ctx)
            .getVariantWithSpecifiedDiscounts({
              variantId: item.variantId,
              saleId: item?.saleId ?? undefined,
              quantity: item.quantity,
            });

          return variant;
        })
      );

      return items;
    }),

  guestCheckout: publicProcedure
    .input(
      z.object({
        items: z.array(itemSchema),
        couponCode: z.string().optional(),
        storeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Reference getVariant

      const cartQuantity = input.items.reduce(
        (acc, item) => acc + item.quantity,
        0
      );

      const cartSubtotal = input.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      const items: Item[] = await Promise.all(
        input.items.map(async (item) => {
          const variant = await shoppingBagRouter.createCaller(ctx).getVariant({
            variantId: item.variantId,
            quantity: item.quantity,
            cartQuantity,
            cartSubtotal,
          });
          return variant;
        })
      );

      const subtotal = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      const coupon = input.couponCode
        ? await couponRouter.createCaller(ctx).calculateValue({
            couponCode: input.couponCode,
            cartItems: items,
            subtotal,
          })
        : null;

      const shipping = await storeRouter
        .createCaller(ctx)
        .getShipping({ storeId: input.storeId, subTotal: subtotal });

      const url = await paymentProcessor.startCheckout({
        items,
        shippingCost: shipping,
        userId: ctx.session?.user?.id ?? null,
        coupon: coupon
          ? {
              discountAmount: coupon.discountAmount ?? 0,
              discountType: coupon.discountType,
              name: coupon.name,
              valid: coupon.valid,
              id: coupon.id,
            }
          : null,
      });

      return url as { url: string };
    }),

  createPaymentLink: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            variantId: z.string(),
            quantity: z.coerce.number().min(0),
          })
        ),
        couponCode: z.string().optional(),
        storeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Reference getVariant
      const cartQuantity = input.items.reduce(
        (acc, item) => acc + item.quantity,
        0
      );

      const cartSubtotal = 0;

      const items: Item[] = await Promise.all(
        input.items.map(async (item) => {
          const variant = await shoppingBagRouter.createCaller(ctx).getVariant({
            variantId: item.variantId,
            quantity: item.quantity,
            cartQuantity,
            cartSubtotal,
          });
          return variant;
        })
      );

      const subtotal = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      const coupon = input.couponCode
        ? await couponRouter.createCaller(ctx).calculateValue({
            couponCode: input.couponCode,
            cartItems: items,
            subtotal,
          })
        : null;

      const shipping = await storeRouter
        .createCaller(ctx)
        .getShipping({ storeId: input.storeId, subTotal: subtotal });

      console.log(items);

      const url = await paymentProcessor.createPaymentLink({
        items,
        shippingCost: shipping,
        coupon: coupon
          ? {
              discountAmount: coupon.discountAmount ?? 0,
              discountType: coupon.discountType,
              name: coupon.name,
              valid: coupon.valid,
              id: coupon.id,
            }
          : null,
      });

      return url as { url: string };
    }),

  createCart: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx }) => {
      const cart = await ctx.db.cart.create({
        data: {
          storeId: env.NEXT_PUBLIC_STORE_ID,
          userId: ctx.session.user.id,
        },
      });

      return cart;
    }),

  setCartItemQuantity: protectedProcedure
    .input(
      z.object({
        cartItemId: z.string(),
        quantity: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const cartItem = await ctx.db.cartItem.update({
        where: {
          id: input.cartItemId,
        },
        data: {
          quantity: input.quantity,
        },
      });

      const variant = await ctx.db.variation.findUnique({
        where: {
          id: cartItem.variantId,
        },
        select: {
          quantity: true,
        },
      });

      if (!variant)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found.",
        });

      if (cartItem.quantity <= 0) {
        await ctx.db.cartItem.delete({
          where: {
            id: input.cartItemId,
          },
        });
      }

      if (cartItem.quantity > variant.quantity) {
        await ctx.db.cartItem.update({
          where: {
            id: input.cartItemId,
          },
          data: {
            quantity: variant.quantity,
          },
        });
      }

      return cartItem;
    }),

  removeAllCartItems: protectedProcedure
    .input(z.object({ cartId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const cartItems = await ctx.db.cartItem.deleteMany({
        where: {
          cartId: input.cartId,
        },
      });

      return cartItems;
    }),
  setCartItems: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            variantId: z.string(),
            quantity: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const currentCart: { id: string } = await shoppingBagRouter
        .createCaller(ctx)
        .getCurrentUserCart();

      console.log(currentCart);

      await ctx.db.cartItem.deleteMany({
        where: {
          cartId: currentCart.id,
        },
      });

      const cart = await ctx.db.cart.update({
        where: {
          id: currentCart.id,
        },
        data: {
          cartItems: {
            createMany: {
              data: input.items.map((item) => {
                return {
                  variantId: item.variantId,
                  quantity: item.quantity,
                };
              }),
            },
          },
        },
        include: {
          cartItems: true,
        },
      });
      console.log(input.items);
      return cart;
    }),
  getCurrentUserCart: protectedProcedure.query(async ({ ctx }) => {
    let cart;
    cart = await ctx.db.cart.findFirst({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        cartItems: true,
      },
    });

    if (!cart) {
      cart = await ctx.db.cart.create({
        data: {
          storeId: env.NEXT_PUBLIC_STORE_ID,
          userId: ctx.session.user.id,
        },
        include: {
          cartItems: true,
        },
      });
    }

    return cart;
  }),

  removeCartItem: protectedProcedure
    .input(z.object({ cartItemId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const cartItem = await ctx.db.cartItem.delete({
        where: {
          id: input.cartItemId,
        },
      });

      return cartItem;
    }),
});
