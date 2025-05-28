import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { z } from "zod";

import { emailService } from "@atomic-trade/email";
import { ProductRequestStatus, QuoteStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { env } from "~/env";
import { GenericOrderUpdateEmail } from "~/lib/email-templates/generic-order-update-email";
import {
  productQuoteValidator,
  productRequestFormValidator,
} from "~/lib/validators/product-request";

export const productRequestRouter = createTRPCRouter({
  getAll: adminProcedure.input(z.string()).query(({ ctx, input: storeId }) => {
    return ctx.db.productRequest.findMany({
      where: { storeId },
      include: { quotes: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  get: adminProcedure.input(z.string()).query(({ ctx, input: requestId }) => {
    return ctx.db.productRequest.findUnique({
      where: { id: requestId },
      include: {
        quotes: true,
        customer: {
          include: { addresses: true, _count: { select: { orders: true } } },
        },
        order: true,
      },
    });
  }),

  create: adminProcedure
    .input(
      productRequestFormValidator
        .omit({ customer: true, tempImages: true, orderId: true, quotes: true })
        .extend({ storeId: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      const { customerId, ...rest } = input;
      const customOrder = await ctx.db.productRequest.create({
        data: {
          ...rest,
          customerId,
        },
      });

      return {
        data: customOrder,
        message: "Request created successfully",
      };
    }),

  update: adminProcedure
    .input(
      productRequestFormValidator
        .omit({ customer: true, tempImages: true, orderId: true, quotes: true })
        .extend({ requestId: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      const { customerId, requestId, ...rest } = input;
      const orderRequest = await ctx.db.productRequest.update({
        where: { id: requestId },
        data: {
          ...rest,
          customer: customerId
            ? { connect: { id: customerId } }
            : { disconnect: true },
        },
      });

      return {
        data: orderRequest,
        message: "Request updated successfully",
      };
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: requestId }) => {
      const request = await ctx.db.productRequest.delete({
        where: { id: requestId },
      });

      return {
        data: request,
        message: "Request deleted successfully",
      };
    }),

  sendNewQuote: adminProcedure
    .input(
      productQuoteValidator
        .omit({
          createdAt: true,
          updatedAt: true,
          id: true,
        })
        .extend({ requestId: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      const { requestId, ...rest } = input;
      const request = await ctx.db.productRequest.findUnique({
        where: { id: requestId },
        select: { email: true, store: { select: { name: true, logo: true } } },
      });

      if (!request) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Request not found",
        });
      }
      const quote = await ctx.db.productQuote.create({
        data: {
          ...rest,
          expiresAt: rest.expiresAt ? new Date(rest.expiresAt) : undefined,
          productRequest: { connect: { id: requestId } },
        },
      });

      const fromEmail = `${request.store.name} <support@dreamwalkerstudios.co>`;
      const logo = `${env.NEXT_PUBLIC_STORAGE_URL}/misc/${request.store.logo}`;
      const email = await emailService.sendEmail({
        to: request.email,
        from: fromEmail,
        subject: `Quote for your product request #${input.requestId}`,
        data: {
          email: request.email,
          storeName: request.store.name,
          message: "New quote sent",
          logo,
        },
        template: GenericOrderUpdateEmail,
      });

      return {
        data: { email, quote },
        message: "Quote sent successfully",
      };
    }),

  resendQuote: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: quoteId }) => {
      const quote = await ctx.db.productQuote.findUnique({
        where: { id: quoteId },
        include: {
          productRequest: {
            select: {
              id: true,
              email: true,
              store: { select: { name: true, logo: true } },
            },
          },
        },
      });

      if (!quote) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Quote not found",
        });
      }

      const fromEmail = `${quote.productRequest.store.name} <support@dreamwalkerstudios.co>`;
      const logo = `${env.NEXT_PUBLIC_STORAGE_URL}/misc/${quote.productRequest.store.logo}`;

      const email = await emailService.sendEmail({
        to: quote.productRequest.email,
        from: fromEmail,
        subject: `Quote for your product request #${quote.productRequest.id}`,
        data: {
          email: quote.productRequest.email,
          storeName: quote.productRequest.store.name,
          message: "New quote sent",
          logo,
        },
        template: GenericOrderUpdateEmail,
      });

      return {
        data: { email, quote },
        message: "Quote resent successfully",
      };
    }),

  rejectQuote: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: quoteId }) => {
      const quote = await ctx.db.productQuote.update({
        where: { id: quoteId },
        data: { status: QuoteStatus.REJECTED },
      });

      return {
        data: quote,
        message: "Quote rejected successfully",
      };
    }),

  approveQuote: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: quoteId }) => {
      const quote = await ctx.db.productQuote.update({
        where: { id: quoteId },
        data: { status: QuoteStatus.ACCEPTED },
      });

      return {
        data: quote,
        message: "Quote approved successfully",
      };
    }),

  approveRequest: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: requestId }) => {
      const request = await ctx.db.productRequest.update({
        where: { id: requestId },
        data: { status: ProductRequestStatus.ACCEPTED },
      });

      return {
        data: request,
        message: "Request approved successfully",
      };
    }),

  rejectRequest: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: requestId }) => {
      const request = await ctx.db.productRequest.update({
        where: { id: requestId },
        data: { status: ProductRequestStatus.REJECTED },
      });

      return {
        data: request,
        message: "Request rejected successfully",
      };
    }),

  updateQuoteStatus: adminProcedure
    .input(
      z.object({
        quoteId: z.string(),
        status: z.nativeEnum(QuoteStatus),
      }),
    )
    .mutation(async ({ ctx, input: { quoteId, status } }) => {
      const quote = await ctx.db.productQuote.update({
        where: { id: quoteId },
        data: { status },
      });

      return {
        data: quote,
        message: "Quote updated successfully",
      };
    }),
});
