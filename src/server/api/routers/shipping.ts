import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { emailService } from "~/lib/email";
import { CustomerTrackOrderEmail } from "~/lib/email/email-templates/customer.track-order";
import { shippingService } from "~/lib/shipping";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

import { emailConfig } from "~/lib/email/email.config";

import {
  addressValidator,
  packageValidator,
  shippingLabelValidator,
} from "~/lib/validators/shipping";

export const shippingLabelRouter = createTRPCRouter({
  verifyAddress: adminProcedure
    .input(addressValidator)
    .mutation(async ({ input }) => {
      const address = await shippingService.verifyAddress(input);

      if (!address)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Shipping address not found.",
        });

      return {
        data: address,
        message: "Shipping address verified successfully",
      };
    }),

  getAvailableRates: adminProcedure
    .input(
      z.object({
        customerAddress: addressValidator,
        businessAddress: addressValidator,
        parcel: packageValidator,
        shipmentId: z.string().optional(),
        orderId: z.string(),
      })
    )
    .query(async ({ input }) => {
      let rates;

      if (input.shipmentId) {
        rates = await shippingService.getRates({ id: input.shipmentId });
      } else {
        rates = await shippingService.createRates({
          fromAddress: input.businessAddress,
          toAddress: input.customerAddress,
          parcel: {
            length: input.parcel.package_length,
            width: input.parcel.package_width,
            height: input.parcel.package_height,
            distance_unit: input.parcel.distance_unit ?? "in",
            mass_unit: input.parcel.mass_unit ?? "lb",
            weight:
              (input.parcel.package_weight_lbs ?? 0) * 16 +
              (input.parcel.package_weight_oz ?? 0) / 16,
          },
          orderId: input.orderId,
        });
      }

      if (!rates)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Shipping rates not found.",
        });

      return rates;
    }),
  getLabel: adminProcedure
    .input(z.string())
    .query(async ({ input: labelId, ctx }) => {
      const label = await ctx.db.fulfillment.findUnique({
        where: { id: labelId },
      });

      if (!label)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Shipping label not found.",
        });

      return label;
    }),

  getShipments: adminProcedure.query(async ({}) => {
    const shipments = await shippingService.getAllTransactions();

    if (!shipments)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Shipments not found.",
      });

    return shipments;
  }),

  createLabel: adminProcedure
    .input(shippingLabelValidator)
    .mutation(async ({ input, ctx }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
      });

      if (!order)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found.",
        });

      const shippingLabel = await shippingService.getLabel({
        id: input.rateId,
        shipmentId: input.shipmentId,
        labelSize: input.labelSize,
      });

      if (!shippingLabel)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating shipping label.",
        });

      const dbEntry = await ctx.db.fulfillment.create({
        data: {
          items: { connect: input.items },
          provider: "EASYPOST",
          shippedAt: input.shipDate,
          providerId: input.shipmentId,
          trackingNumber: shippingLabel?.tracking_number,
          trackingUrl: shippingLabel?.tracking_url,
          labelUrl: shippingLabel?.label_url,
          cost: Number(input.cost ?? 0) * 100,
          carrier: input.carrier,
          timeEstimate: input.timeEstimate,
          status: "LABEL_PURCHASED",
          expireAt: input.expireAt,
          order: { connect: { id: input.orderId } },
        },
      });

      const checkIfAllItemsArePartOfAFulfillment = await ctx.db.orderItem.count(
        {
          where: {
            orderId: input.orderId,
            fulfillmentId: null,
          },
        }
      );

      await ctx.db.order.update({
        where: { id: input.orderId },
        data: {
          timeline: {
            create: {
              description: `Shipping label purchased for $${
                Number(input.cost) ?? 0
              } on ${new Date().toDateString()}`,

              title: "Shipping Label Purchased",
            },
          },
          fulfillmentStatus:
            checkIfAllItemsArePartOfAFulfillment === 0
              ? "AWAITING_SHIPMENT"
              : "PARTIAL",
        },
      });

      if (dbEntry.id && order?.email) {
        const emailData = {
          trackingLink: shippingLabel.tracking_url,
          orderLink: `${process.env.NEXT_PUBLIC_URL}/orders/${input.orderId}`,
          orderId: input.orderId,
        };
        await emailService.sendEmail({
          to: order.email,
          from: emailConfig.noRespondEmail,
          subject: `A shipment from order ${input.orderId} is on the way`,
          data: emailData,
          template: CustomerTrackOrderEmail,
        });
      }

      return {
        shippingLabel,
        dbEntry,
        message: "Shipping label created successfully",
      };
    }),
});
