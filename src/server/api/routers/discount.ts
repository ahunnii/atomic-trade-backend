import { getStoreIdViaTRPC } from "~/server/actions/store";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { calculateCartDiscounts } from "~/utils/calculate-cart-discounts";
import { z } from "zod";

import { createId } from "@paralleldrive/cuid2";
import { DiscountAmountType } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { discountFormValidator } from "~/lib/validators/discount";

export const discountRouter = createTRPCRouter({
  getAll: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input: storeSlug }) => {
      const storeId = await getStoreIdViaTRPC(storeSlug);

      const discounts = await ctx.db.discount.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
      });

      return discounts;
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

  // calculateItems: publicProcedure
  //   .input(
  //     z.object({
  //       storeId: z.string(),
  //       orderId: z.string().optional(),
  //       cartId: z.string().optional(),
  //       cartItems: z.array(
  //         z.object({
  //           variantId: z.string(),
  //           quantity: z.number(),
  //         }),
  //       ),
  //       couponCode: z.string().optional(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const { storeId, orderId, cartId, couponCode } = input;

  //     const store = await ctx.db.store.findUnique({
  //       where: { id: storeId },
  //       include: {
  //         discounts: {
  //           include: {
  //             variants: {
  //               include: {
  //                 product: true,
  //               },
  //             },
  //             collections: {
  //               include: {
  //                 products: {
  //                   include: {
  //                     variants: true,
  //                   },
  //                 },
  //               },
  //             },
  //             customers: true,
  //           },
  //         },
  //         collections: true,
  //       },
  //     });

  //     if (!store) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Store not found",
  //       });
  //     }

  //     const variants = await ctx.db.variation.findMany({
  //       where: {
  //         product: { storeId },
  //       },
  //       include: { product: true },
  //     });

  //     const couponDiscount = await ctx.db.discount.findFirst({
  //       where: {
  //         code: couponCode,
  //         storeId,
  //       },
  //       include: {
  //         variants: {
  //           include: {
  //             product: true,
  //           },
  //         },
  //         collections: {
  //           include: {
  //             products: {
  //               include: {
  //                 variants: true,
  //               },
  //             },
  //           },
  //         },
  //         customers: true,
  //       },
  //     });

  //     const cartItems = input.cartItems.map((item) => ({
  //       variantId: item.variantId,
  //       quantity: item.quantity,
  //       priceInCents:
  //         variants.find((v) => v.id === item.variantId)?.priceInCents ?? 0,
  //       compareAtPriceInCents:
  //         variants.find((v) => v.id === item.variantId)
  //           ?.compareAtPriceInCents ?? null,
  //     }));

  //     const enrichedDiscounts = store?.discounts?.map((d) => ({
  //       id: d.id,
  //       code: d.code,
  //       type: d.type,
  //       amountType: d.amountType,
  //       amount: d.amount,
  //       isActive: d.isActive,
  //       startsAt: d.startsAt,
  //       endsAt: d?.endsAt ?? undefined,
  //       combineWithProductDiscounts: d.combineWithProductDiscounts,
  //       combineWithOrderDiscounts: d.combineWithOrderDiscounts,
  //       combineWithShippingDiscounts: d.combineWithShippingDiscounts,
  //       minimumPurchaseInCents: d.minimumPurchaseInCents ?? undefined,
  //       minimumQuantity: d.minimumQuantity ?? undefined,
  //       maximumUses: d.maximumUses ?? undefined,
  //       uses: d.uses ?? undefined,
  //       customers: d.customers.map((c) => ({ id: c.id })),
  //       variants: d.variants.map((v) => ({ id: v.id })),
  //       collections: d.collections.map((c) => ({
  //         id: c.id,
  //         products:
  //           c.products?.map((p) => ({
  //             variants: p.variants?.map((v) => ({ id: v.id })) ?? [],
  //           })) ?? [],
  //       })),
  //       applyToAllProducts: d.applyToAllProducts,
  //       applyToOrder: d.applyToOrder,
  //       applyToShipping: d.applyToShipping,
  //     }));

  //     console.log("--- DISCOUNTS BEING PASSED ---");
  //     console.log(JSON.stringify(store.discounts, null, 2));
  //     console.log("--- CART ITEMS BEING PASSED ---");
  //     console.log(JSON.stringify(cartItems, null, 2));
  //     console.log("--- VARIANTS BEING PASSED ---");
  //     console.log(
  //       JSON.stringify(
  //         variants.map((v) => ({
  //           id: v.id,
  //           priceInCents: v.priceInCents,
  //           compareAtPriceInCents: v.compareAtPriceInCents,
  //         })),
  //         null,
  //         2,
  //       ),
  //     );

  //     const data = calculateCartDiscounts({
  //       cartItems,
  //       discounts: enrichedDiscounts,
  //       collections: store.collections as Collection[],
  //       shippingCost: 0,
  //       couponDiscount: {
  //         id: couponDiscount?.id ?? "",

  //         code: couponDiscount?.code ?? "",
  //         type: couponDiscount?.type ?? "PRODUCT",
  //         amountType: couponDiscount?.amountType ?? "FIXED",
  //         amount: couponDiscount?.amount ?? 0,
  //         isActive: couponDiscount?.isActive ?? false,
  //         startsAt: couponDiscount?.startsAt ?? new Date(),
  //         endsAt: couponDiscount?.endsAt ?? undefined,
  //         combineWithProductDiscounts:
  //           couponDiscount?.combineWithProductDiscounts ?? false,
  //         combineWithOrderDiscounts:
  //           couponDiscount?.combineWithOrderDiscounts ?? false,
  //         combineWithShippingDiscounts:
  //           couponDiscount?.combineWithShippingDiscounts ?? false,
  //         customers: couponDiscount?.customers ?? [],
  //         variants: couponDiscount?.variants ?? [],
  //         collections: couponDiscount?.collections ?? [],
  //         applyToAllProducts: couponDiscount?.applyToAllProducts ?? false,
  //         applyToOrder: couponDiscount?.applyToOrder ?? false,
  //         applyToShipping: couponDiscount?.applyToShipping ?? false,
  //       },
  //       variants: variants.map((v) => ({
  //         id: v.id,
  //         priceInCents: v.priceInCents,
  //         compareAtPriceInCents: v.compareAtPriceInCents,
  //       })),
  //     });

  //     const pain = await ctx.db.discount.findMany({
  //       where: {
  //         variants: {
  //           some: {
  //             id: "cc4a006d-fa4a-4454-b977-90a87e484ba8",
  //           },
  //         },
  //       },
  //     });

  //     return {
  //       data,
  //       pain,
  //       message: "Cart discounts calculated successfully",
  //     };
  //   }),
  // calculateItems: publicProcedure
  //   .input(
  //     z.object({
  //       storeId: z.string(),
  //       orderId: z.string().optional(),
  //       cartId: z.string().optional(),
  //       cartItems: z.array(
  //         z.object({
  //           variantId: z.string(),
  //           quantity: z.number(),
  //         }),
  //       ),
  //       couponCode: z.string().optional(),
  //       customerId: z.string().optional(), // Optional if you want to pass logged in user
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const { storeId, cartItems, couponCode, customerId } = input;

  //     const store = await ctx.db.store.findUnique({
  //       where: { id: storeId },
  //       include: {
  //         discounts: {
  //           include: {
  //             variants: true,
  //             collections: {
  //               include: {
  //                 products: {
  //                   include: { variants: true },
  //                 },
  //               },
  //             },
  //             customers: true,
  //           },
  //         },
  //         collections: {
  //           include: {
  //             products: {
  //               include: { variants: true },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     if (!store) {
  //       throw new TRPCError({ code: "NOT_FOUND", message: "Store not found" });
  //     }

  //     const variants = await ctx.db.variation.findMany({
  //       where: { product: { storeId } },
  //       include: { product: true },
  //     });

  //     const couponDiscount = couponCode
  //       ? await ctx.db.discount.findFirst({
  //           where: {
  //             code: couponCode,
  //             storeId,
  //             isActive: true,
  //           },
  //           include: {
  //             variants: true,
  //             collections: {
  //               include: {
  //                 products: {
  //                   include: { variants: true },
  //                 },
  //               },
  //             },
  //             customers: true,
  //           },
  //         })
  //       : undefined;

  //     // Prepare cart items
  //     const preparedCartItems = cartItems.map((item) => {
  //       const variant = variants.find((v) => v.id === item.variantId);
  //       return {
  //         variantId: item.variantId,
  //         quantity: item.quantity,
  //         priceInCents: variant?.priceInCents ?? 0,
  //         compareAtPriceInCents: variant?.compareAtPriceInCents ?? null,
  //       };
  //     });

  //     // Prepare variants for calculation
  //     const preparedVariants = variants.map((variant) => ({
  //       id: variant.id,
  //       priceInCents: variant.priceInCents,
  //       compareAtPriceInCents: variant.compareAtPriceInCents,
  //     }));

  //     const data = calculateCartDiscounts({
  //       cartItems: preparedCartItems,
  //       discounts: store.discounts,
  //       collections: store.collections,
  //       variants: preparedVariants,
  //       shippingCost: store.hasFlatRate ? store.flatRateAmount : 0,
  //       couponDiscount: couponDiscount ?? undefined,
  //       customerId: customerId ?? undefined,
  //     });

  //     return {
  //       data,
  //       message: "Cart discounts calculated successfully",
  //     };
  //   }),

  calculateItems: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        cartItems: z.array(
          z.object({
            variantId: z.string(),
            quantity: z.number(),
          }),
        ),
        couponCode: z.string().optional(),
        customerId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        storeId,
        cartItems: rawCartItems,
        couponCode,
        customerId,
      } = input;

      const store = await ctx.db.store.findUnique({
        where: { id: storeId },
        include: {
          discounts: {
            include: { collections: true, variants: true, customers: true },
          },
          collections: {
            include: { products: { include: { variants: true } } },
          },
        },
      });

      if (!store) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Store not found" });
      }

      const variants = await ctx.db.variation.findMany({
        where: { product: { storeId } },
        include: { product: true },
      });

      const couponDiscount = couponCode
        ? await ctx.db.discount.findFirst({
            where: { storeId, code: couponCode },
            include: { collections: true, variants: true, customers: true },
          })
        : null;

      const cartItems = rawCartItems.map((item) => {
        const variant = variants.find((v) => v.id === item.variantId);
        return {
          id: item.variantId,
          variantId: item.variantId,
          quantity: item.quantity,
          // priceInCents: variant?.priceInCents ?? 0,
          // compareAtPriceInCents: variant?.compareAtPriceInCents ?? undefined,
          variant: {
            id: variant?.id ?? "",
            priceInCents: variant?.priceInCents ?? 0,
            compareAtPriceInCents: variant?.compareAtPriceInCents ?? undefined,
            name: variant?.name ?? "",
            product: {
              id: variant?.productId ?? "",
              name: variant?.product?.name ?? "",
              featuredImage: variant?.product?.featuredImage ?? "",
            },
          },
        };
      });

      const data = calculateCartDiscounts({
        cartItems,
        discounts: store.discounts ?? [],
        collections: store.collections ?? [],
        variants: variants.map((v) => ({
          variantId: v.id,
          priceInCents: v.priceInCents,
        })),
        shippingCost: store.flatRateAmount ?? 0,
        customerId,
        couponDiscount: couponDiscount ?? undefined,
      });

      return { data, message: "Cart discounts calculated successfully" };
    }),
});
