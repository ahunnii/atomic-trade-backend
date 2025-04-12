// import { type Item } from "~/providers/cart-provider";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
// import { getTotals } from "~/utils/calculate-prices";
import { z } from "zod";

// import { FulfillmentStatus, ShipmentStatus } from "@prisma/client";
// import { TRPCError } from "@trpc/server";

// import { emailService } from "~/lib/email";
// import { CustomerNotifyPickupEmail } from "~/lib/email/email-templates/customer.notify-pickup";
// import { emailConfig } from "~/lib/email/email.config";
// import { createOrderNumber } from "~/lib/orders/create-order-number";
import {
  // newOrderValidator,
  orderFormValidator,
  productOrderFormValidator,
  // orderValidator,
  updateOrderValidator,
} from "~/lib/validators/order";

// import { shoppingBagRouter } from "./shopping-bag";
// import { storeRouter } from "./store";

export const ordersRouter = createTRPCRouter({
  // markAsFulfilled: adminProcedure
  //   .input(z.string())
  //   .mutation(async ({ ctx, input: orderId }) => {
  //     const order = await ctx.db.order.update({
  //       where: { id: orderId },
  //       data: {
  //         fulfillmentStatus: "FULFILLED",
  //         timeline: {
  //           create: {
  //             title: "Order Fulfilled",
  //             description: `Admin has marked the order fulfilled on ${new Date().toLocaleString()}`,
  //           },
  //         },
  //       },
  //     });

  //     return {
  //       data: order,
  //       message: "Order marked as fulfilled",
  //     };
  //   }),

  // sendPickupNotification: adminProcedure
  //   .input(z.string())
  //   .mutation(async ({ ctx, input: orderId }) => {
  //     const order = await ctx.db.order.findUnique({
  //       where: { id: orderId },
  //       include: { store: { include: { address: true } } },
  //     });

  //     if (!order) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Order not found",
  //       });
  //     }

  //     const email = await emailService.sendEmail({
  //       to: order.email,
  //       from: emailConfig.noRespondEmail,
  //       subject: ` Your order, #${orderId} is ready for pickup!`,
  //       data: {
  //         orderId: order.id,
  //         orderLink: order?.receiptLink ?? undefined,
  //         pickupInstructions: order?.store?.pickupInstructions ?? undefined,
  //         address: {
  //           name: order.store?.address?.name ?? "",
  //           street: order.store?.address?.street ?? "",
  //           city: order.store?.address?.city ?? "",
  //           state: order.store?.address?.state ?? "",
  //           zip: order.store?.address?.postal_code ?? "",
  //           country: order.store?.address?.country ?? "",
  //         },
  //       },
  //       template: CustomerNotifyPickupEmail,
  //     });

  //     await ctx.db.order.update({
  //       where: { id: orderId },
  //       data: {
  //         fulfillmentStatus: "AWAITING_PICKUP",
  //         timeline: {
  //           create: {
  //             title: "Order Awaiting Pickup",
  //             description: `Admin has sent the pickup notification to the customer on ${new Date().toLocaleString()}`,
  //           },
  //         },
  //       },
  //     });

  //     return {
  //       data: email,
  //       message: "Pickup notification sent",
  //     };
  //   }),

  // getUnfulfilledItems: adminProcedure
  //   .input(z.string())
  //   .query(async ({ ctx, input: orderId }) => {
  //     const orderItems = await ctx.db.orderItem.findMany({
  //       where: {
  //         orderId,
  //         fulfillmentId: null,
  //       },
  //       include: {
  //         sale: true,
  //         requestItem: true,
  //         variant: { include: { product: true } },
  //       },
  //     });

  //     return {
  //       data: orderItems,
  //       message: "Unfulfilled order items retrieved",
  //     };
  //   }),

  // markAsPaid: adminProcedure
  //   .input(z.string())
  //   .mutation(async ({ ctx, input: orderId }) => {
  //     const order = await ctx.db.order.update({
  //       where: { id: orderId },
  //       data: {
  //         paymentStatus: "PAID",
  //         timeline: {
  //           create: {
  //             title: "Order Paid",
  //             description: `Admin has marked the order paid on ${new Date().toLocaleString()}`,
  //           },
  //         },
  //       },
  //     });

  //     return {
  //       data: order,
  //       message: "Order marked as paid",
  //     };
  //   }),

  // markAsCanceled: adminProcedure
  //   .input(z.string())
  //   .mutation(async ({ ctx, input: orderId }) => {
  //     const order = await ctx.db.order.update({
  //       where: { id: orderId },
  //       data: {
  //         fulfillmentStatus: "CANCELLED",
  //         paymentStatus: "CANCELLED",
  //         timeline: {
  //           create: {
  //             title: "Order Cancelled",
  //             description: `Admin has marked the order cancelled on ${new Date().toLocaleString()}`,
  //           },
  //         },
  //       },
  //     });

  //     return {
  //       data: order,
  //       message: "Order marked as cancelled",
  //     };
  //   }),

  // archive: adminProcedure
  //   .input(z.string())
  //   .mutation(async ({ ctx, input: orderId }) => {
  //     const order = await ctx.db.order.update({
  //       where: { id: orderId },
  //       data: {
  //         deletedAt: new Date(),
  //         timeline: {
  //           create: {
  //             title: "Order Archived",
  //             description: `Admin has archived the order on ${new Date().toLocaleString()}`,
  //           },
  //         },
  //       },
  //     });

  //     return {
  //       data: order,
  //       message: "Order archived",
  //     };
  //   }),

  // getCount: adminProcedure
  //   .input(z.string())
  //   .query(async ({ ctx, input: storeId }) => {
  //     return ctx.db.order.count({
  //       where: {
  //         storeId,
  //         paymentStatus: "PAID",
  //         deletedAt: null,
  //         NOT: [
  //           {
  //             fulfillmentStatus: {
  //               in: ["FULFILLED", "RESTOCKED", "CANCELLED"],
  //             },
  //           },
  //         ],
  //       },
  //     });
  //   }),

  // assignToUser: adminProcedure
  //   .input(z.object({ orderId: z.string(), userId: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     const order = await ctx.db.order.update({
  //       where: { id: input.orderId },
  //       data: { userId: input.userId },
  //     });

  //     return {
  //       data: order,
  //       message: "Order assigned to user",
  //     };
  //   }),

  // updateNote: adminProcedure
  //   .input(z.object({ orderId: z.string(), note: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     const order = await ctx.db.order.update({
  //       where: { id: input.orderId },
  //       data: { note: input.note },
  //     });

  //     return {
  //       data: order,
  //       message: "Order note updated",
  //     };
  //   }),

  // getAllPaid: adminProcedure
  //   .input(z.string())
  //   .query(async ({ ctx, input: storeId }) => {
  //     return ctx.db.order.findMany({
  //       where: {
  //         storeId,
  //         deletedAt: null,
  //       },
  //       select: {
  //         storeId: true,
  //         email: true,
  //         id: true,

  //         paymentStatus: true,
  //         orderItems: {
  //           select: {
  //             id: true,
  //             quantity: true,
  //           },
  //         },

  //         fulfillmentStatus: true,
  //         shippingAddress: { select: { name: true } },
  //         total: true,
  //         createdAt: true,
  //       },
  //       orderBy: { createdAt: "desc" },
  //     });
  //   }),

  // getAllPending: adminProcedure
  //   .input(z.string())
  //   .query(async ({ ctx, input: storeId }) => {
  //     const orders = await ctx.db.order.findMany({
  //       where: {
  //         storeId,
  //         paymentStatus: "PAID",
  //         NOT: [
  //           {
  //             fulfillmentStatus: {
  //               in: ["FULFILLED", "RESTOCKED", "CANCELLED"],
  //             },
  //           },
  //         ],
  //       },
  //       select: {
  //         storeId: true,
  //         email: true,
  //         id: true,
  //         paymentStatus: true,
  //         total: true,
  //         fulfillmentStatus: true,
  //         shippingAddress: {
  //           select: {
  //             name: true,
  //           },
  //         },

  //         createdAt: true,
  //       },
  //       orderBy: {
  //         createdAt: "desc",
  //       },
  //       take: 4,
  //     });

  //     return {
  //       orders,
  //       orderCount: orders.length,
  //     };
  //   }),

  // updateFulfillmentStatus: adminProcedure
  //   .input(
  //     z.object({
  //       fulfillmentId: z.string(),
  //       status: z.nativeEnum(ShipmentStatus),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const fulfillment = await ctx.db.fulfillment.update({
  //       where: { id: input.fulfillmentId },
  //       data: { status: input.status },
  //     });

  //     return {
  //       data: fulfillment,
  //       message: "Fulfillment status updated",
  //     };
  //   }),

  // updateShippingStatus: adminProcedure
  //   .input(
  //     z.object({
  //       orderId: z.string(),
  //       fulfillmentStatus: z.nativeEnum(FulfillmentStatus),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const order = await ctx.db.order.update({
  //       where: { id: input.orderId },
  //       data: {
  //         fulfillmentStatus: input.fulfillmentStatus,
  //         timeline: {
  //           create: {
  //             title: "Order Fulfillment Status Updated",
  //             description: `Admin has updated the fulfillment status to ${
  //               input.fulfillmentStatus
  //             } on ${new Date().toLocaleString()}`,
  //           },
  //         },
  //       },
  //     });

  //     return {
  //       data: order,
  //       message: "Shipping status updated",
  //     };
  //   }),

  // getCustomerOrderHistory: adminProcedure
  //   .input(
  //     z.object({
  //       storeId: z.string(),
  //       customerId: z.string(),
  //     }),
  //   )
  //   .query(async ({ ctx, input }) => {
  //     return ctx.db.order.findMany({
  //       where: {
  //         storeId: input.storeId,
  //         userId: input.customerId,
  //       },
  //       select: {
  //         storeId: true,
  //         id: true,
  //         paymentStatus: true,
  //         orderItems: { select: { id: true } },
  //         fulfillmentStatus: true,
  //         total: true,
  //         createdAt: true,
  //       },
  //       orderBy: { createdAt: "desc" },
  //     });
  //   }),

  getAll: adminProcedure.input(z.string()).query(({ ctx, input: storeId }) => {
    return ctx.db.order.findMany({
      where: { storeId },
      include: {
        customer: true,
        fulfillment: true,
        payments: true,
        orderItems: { include: { variant: { include: { product: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  get: adminProcedure.input(z.string()).query(({ ctx, input: orderId }) => {
    return ctx.db.order.findUnique({
      where: { id: orderId },
      include: {
        store: true,
        payments: { include: { refunds: true } },
        fulfillment: true,
        notes: { orderBy: { createdAt: "desc" } },
        customer: true,
        orderItems: {
          include: {
            variant: { include: { product: true } },
            requestItem: true,
            sale: true,
          },
        },
      },
    });
  }),

  create: adminProcedure
    .input(productOrderFormValidator.extend({ storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { notes, ...rest } = input;

      // const order = await ctx.db.order.create({
      //   data: {
      //     ...rest,
      //   //   billingAddress: { create: input.billingAddress },
      //   //   shippingAddress: { create: input.shippingAddress },
      //   //   timeline: { createMany: { data: timeline } },
      //   //   orderItems: {
      //   //     createMany: {
      //   //       data: [
      //   //         ...input.orderItems.map((orderItem) => {
      //   //           return {
      //   //             variantId: orderItem.variantId,
      //   //             quantity: orderItem.quantity,
      //   //           };
      //   //         }),
      //   //       ],
      //   //     },
      //   //   },
      //   // },
      // });

      return {
        data: "yeet",
        message: "Order created",
      };
    }),

  // createNew: adminProcedure
  //   .input(newOrderValidator.extend({ storeId: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     // TODO: get overall quantity and subtotal of order
  //     const variants: Item[] = await Promise.all(
  //       input.orderItems.map(async (orderItem) => {
  //         const variant = await shoppingBagRouter.createCaller(ctx).getVariant({
  //           variantId: orderItem.id,
  //           quantity: orderItem.quantity,
  //           cartQuantity: 0,
  //           cartSubtotal: 0,
  //         });
  //         return variant;
  //       }),
  //     );

  //     const totals = getTotals({ items: variants });

  //     const shipping = await storeRouter
  //       .createCaller(ctx)
  //       .getShipping({ subTotal: totals.subTotal });

  //     const shippingCost = input.fulfillmentStatus === "PENDING" ? shipping : 0;

  //     const finalTotal =
  //       totals.subTotal +
  //       (input.ignoreShipping ? 0 : shippingCost) +
  //       (input.ignoreTax ? 0 : totals.tax);
  //     const saleFinalTotal =
  //       totals.discountedSubtotal +
  //       (input.ignoreShipping ? 0 : shippingCost) +
  //       (input.ignoreTax ? 0 : totals.discountedTax);
  //     const finalTax = input.ignoreTax
  //       ? 0
  //       : input.ignoreDiscounts
  //         ? totals.tax
  //         : totals.discountedTax;

  //     const timelineEntries = [
  //       {
  //         title: "Order Created",
  //         description: "Order has been created by admin",
  //       },
  //     ] as { title: string; description: string }[];

  //     if (input.ignoreDiscounts) {
  //       timelineEntries.push({
  //         title: "Discounts Ignored",
  //         description: "Admin has ignored discounts for this order",
  //       });
  //     }

  //     if (input.ignoreShipping) {
  //       timelineEntries.push({
  //         title: "Shipping Ignored",
  //         description: "Admin has ignored shipping for this order",
  //       });
  //     }

  //     if (input.ignoreTax) {
  //       timelineEntries.push({
  //         title: "Tax Ignored",
  //         description: "Admin has ignored tax for this order",
  //       });
  //     }

  //     const order = await ctx.db.order.create({
  //       data: {
  //         paymentMethod: input.paymentMethod ?? "OTHER",
  //         fulfillmentStatus: input.fulfillmentStatus,
  //         paymentStatus: input.paymentStatus,
  //         phone: input.phone,
  //         email: input.email,
  //         store: { connect: { id: input.storeId } },
  //         receiptLink: input?.receiptUrl ?? undefined,
  //         referenceNumber: input?.paymentId ?? undefined,
  //         subtotal: totals.subTotal,
  //         shipping: input?.ignoreShipping ? 0 : shippingCost,
  //         fee: 0,
  //         tax: input?.ignoreTax ? 0 : finalTax,
  //         discount: input?.ignoreDiscounts ? 0 : (totals?.saleTotal ?? 0),
  //         total: input?.ignoreDiscounts ? finalTotal : saleFinalTotal,
  //         billingAddress: {
  //           create: {
  //             name: input.name,
  //             street: input.street,
  //             additional: input.additional,
  //             city: input.city,
  //             state: input.state,
  //             postal_code: input.zip,
  //             country: input.country,
  //           },
  //         },
  //         shippingAddress: {
  //           create: {
  //             name: input.name,
  //             street: input.street,
  //             additional: input.additional,
  //             city: input.city,
  //             state: input.state,
  //             postal_code: input.zip,
  //             country: input.country,
  //           },
  //         },
  //         timeline: { createMany: { data: timelineEntries } },
  //         orderItems: {
  //           createMany: {
  //             data: [
  //               ...variants?.map((orderItem) => {
  //                 return {
  //                   variantId: orderItem.id,
  //                   quantity: orderItem.quantity,
  //                   saleId: orderItem?.saleId ?? undefined,
  //                   price: orderItem?.saleId
  //                     ? orderItem?.salesPrice
  //                     : orderItem?.price,
  //                 };
  //               }),
  //             ],
  //           },
  //         },
  //       },
  //     });

  //     if (input.userId) {
  //       await ctx.db.order.update({
  //         where: { id: order.id },
  //         data: { user: { connect: { id: input.userId } } },
  //       });
  //     }

  //     await ctx.db.order.update({
  //       where: { id: order.id },
  //       data: { orderNumber: createOrderNumber(order.id) },
  //     });

  //     return {
  //       data: order,
  //       message: "Order created",
  //     };
  //   }),

  // updateNew: adminProcedure
  //   .input(newOrderValidator.extend({ orderId: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     const originalOrder = await ctx.db.order.findUnique({
  //       where: { id: input.orderId },
  //     });

  //     if (!originalOrder) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Order not found",
  //       });
  //     }

  //     const variants: Item[] = await Promise.all(
  //       input.orderItems.map(async (orderItem) => {
  //         const variant = await shoppingBagRouter.createCaller(ctx).getVariant({
  //           variantId: orderItem.id,
  //           quantity: orderItem.quantity,
  //           cartQuantity: 0,
  //           cartSubtotal: 0,
  //         });
  //         return variant;
  //       }),
  //     );

  //     const totals = getTotals({ items: variants });

  //     const shipping = await storeRouter
  //       .createCaller(ctx)
  //       .getShipping({ subTotal: totals.subTotal });

  //     const shippingCost = input.fulfillmentStatus === "PENDING" ? shipping : 0;

  //     const finalTotal =
  //       totals.subTotal +
  //       (input.ignoreShipping ? 0 : shippingCost) +
  //       (input.ignoreTax ? 0 : totals.tax);

  //     const saleFinalTotal =
  //       totals.discountedSubtotal +
  //       (input.ignoreShipping ? 0 : shippingCost) +
  //       (input.ignoreTax ? 0 : totals.discountedTax);

  //     const finalTax = input.ignoreTax
  //       ? 0
  //       : input.ignoreDiscounts
  //         ? totals.tax
  //         : totals.discountedTax;

  //     const timelineEntries = [
  //       {
  //         title: "Order Updated",
  //         description: "Order has been updated by admin",
  //       },
  //     ] as { title: string; description: string }[];

  //     if (input.ignoreDiscounts) {
  //       timelineEntries.push({
  //         title: "Discounts Ignored",
  //         description: "Admin has ignored discounts for this order",
  //       });
  //     }

  //     if (input.ignoreDiscounts) {
  //       timelineEntries.push({
  //         title: "Discounts Ignored",
  //         description: "Admin has ignored discounts for this order",
  //       });
  //     }

  //     if (input.ignoreShipping) {
  //       timelineEntries.push({
  //         title: "Shipping Ignored",
  //         description: "Admin has ignored shipping for this order",
  //       });
  //     }

  //     if (input.ignoreTax) {
  //       timelineEntries.push({
  //         title: "Tax Ignored",
  //         description: "Admin has ignored tax for this order",
  //       });
  //     }

  //     await ctx.db.order.update({
  //       where: {
  //         id: input.orderId,
  //       },
  //       data: {
  //         paymentMethod: input.paymentMethod,
  //         fulfillmentStatus: input.fulfillmentStatus,
  //         paymentStatus: input.paymentStatus,

  //         phone: input.phone,
  //         email: input.email,
  //         user: { connect: { id: input?.userId ?? undefined } },

  //         receiptLink: input?.receiptUrl ?? undefined,
  //         referenceNumber: input?.paymentId ?? undefined,

  //         subtotal: totals.subTotal,
  //         shipping: input?.ignoreShipping ? 0 : shippingCost,
  //         fee: 0,
  //         tax: input?.ignoreTax ? 0 : finalTax,
  //         discount: input?.ignoreDiscounts ? 0 : (totals?.saleTotal ?? 0),
  //         total: input?.ignoreDiscounts ? finalTotal : saleFinalTotal,
  //         billingAddress: {
  //           upsert: {
  //             create: {
  //               name: input.name,
  //               street: input.street,
  //               additional: input.additional,
  //               city: input.city,
  //               state: input.state,
  //               postal_code: input.zip,
  //               country: input.country,
  //             },
  //             update: {
  //               name: input.name,
  //               street: input.street,
  //               additional: input.additional,
  //               city: input.city,
  //               state: input.state,
  //               postal_code: input.zip,
  //               country: input.country,
  //             },
  //           },
  //         },
  //         shippingAddress: {
  //           upsert: {
  //             create: {
  //               name: input.name,
  //               street: input.street,
  //               additional: input.additional,
  //               city: input.city,
  //               state: input.state,
  //               postal_code: input.zip,
  //               country: input.country,
  //             },
  //             update: {
  //               name: input.name,
  //               street: input.street,
  //               additional: input.additional,
  //               city: input.city,
  //               state: input.state,
  //               postal_code: input.zip,
  //               country: input.country,
  //             },
  //           },
  //         },
  //         timeline: {
  //           createMany: {
  //             data: timelineEntries,
  //           },
  //         },
  //         orderItems: {
  //           deleteMany: {},
  //         },
  //       },
  //     });

  //     const updatedOrder = await ctx.db.order.update({
  //       where: { id: input.orderId },
  //       data: {
  //         orderItems: {
  //           createMany: {
  //             data: [
  //               ...variants.map((orderItem) => {
  //                 return {
  //                   variantId: orderItem.id,
  //                   quantity: orderItem.quantity,
  //                   saleId: orderItem?.saleId ?? undefined,
  //                   price: orderItem?.saleId
  //                     ? orderItem?.salesPrice
  //                     : orderItem?.price,
  //                 };
  //               }),
  //             ],
  //           },
  //         },
  //       },
  //     });

  //     return {
  //       data: updatedOrder,
  //       message: "Order updated",
  //     };
  //   }),

  update: adminProcedure
    .input(
      productOrderFormValidator.extend({
        storeId: z.string(),
        orderId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // const order = await ctx.db.order.update({
      //   where: { id: input.orderId },
      //   data: {
      //     ...input,
      //     billingAddress: {
      //       upsert: {
      //         create: input.billingAddress,
      //         update: input.billingAddress,
      //       },
      //     },
      //     shippingAddress: {
      //       upsert: {
      //         create: input.shippingAddress,
      //         update: input.shippingAddress,
      //       },
      //     },
      //     orderItems: {
      //       deleteMany: {},
      //     },
      //   },
      // });

      // await ctx.db.orderItem.createMany({
      //   data: input.orderItems.map((orderItem) => {
      //     return {
      //       orderId: order.id,
      //       variantId: orderItem.variantId,
      //       quantity: orderItem.quantity,
      //     };
      //   }),
      // });

      return {
        data: "yeet",
        message: "Order updated",
      };
    }),

  delete: adminProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const order = await ctx.db.order.delete({ where: { id: input } });

    return {
      data: order,
      message: "Order deleted",
    };
  }),
});
