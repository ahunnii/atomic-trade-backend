import { TRPCError } from "@trpc/server";

import { z } from "zod";

import { env } from "~/env.mjs";
import {
  adminProcedure,
  createTRPCRouter,
  rateLimitedProcedure,
} from "~/server/api/trpc";

import { emailService } from "~/lib/email";
import { AdminCustomRequestNotificationEmail } from "~/lib/email/email-templates/admin.custom-order-notify";

import { CustomerCustomRejectEmail } from "~/lib/email/email-templates/customer-requests/customer.custom-order-reject";

import { RequestStatus } from "@prisma/client";
import { CustomerRequestAcknowledgeEmail } from "~/lib/email/email-templates/customer-requests/customer.custom-order-notify";
import { CustomerRequestQuoteEmail } from "~/lib/email/email-templates/customer-requests/customer.request-quote";
import { emailConfig } from "~/lib/email/email.config";
import {
  customerFacingRequestValidator,
  requestValidator,
} from "~/lib/validators/custom-request";
import { db } from "~/server/db";

export const requestRouter = createTRPCRouter({
  search: adminProcedure
    .input(z.object({ queryString: z.string(), storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (input.queryString === "") return [];

      const orders = await ctx.db.request.findMany({
        where: {
          storeId: input.storeId,
          OR: [
            { name: { contains: input.queryString } },
            { email: { contains: input.queryString } },
            { details: { contains: input.queryString } },
            { notes: { contains: input.queryString } },
          ],
        },

        orderBy: { createdAt: "desc" },
      });

      return orders;
    }),

  send: rateLimitedProcedure
    .input(customerFacingRequestValidator.extend({ storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check to see if user is logged in or not:
      const user = ctx?.session?.user?.id;

      const customer = await handleCustomer({
        user,
        email: input.email,
        name: input.name,
      });

      const customOrder = await ctx.db.request.create({
        data: {
          name: input.name,
          email: input.email,
          details: input.request,
          storeId: input.storeId,
          status: RequestStatus.PENDING,
          images: input.images,
          customerId: customer.id,
        },
      });

      const emailData = {
        firstName: input.name,
        orderLink: `${env.NEXT_PUBLIC_URL}/admin/${input.storeId}/custom-orders/${customOrder.id}/edit`,
      };

      // Notify the admin of the new custom order request
      await emailService.sendEmail({
        to: emailConfig.adminEmail,
        from: emailConfig.noRespondEmail,
        subject: "New Custom Order Request",
        data: emailData,
        template: AdminCustomRequestNotificationEmail,
      });

      // Notify the customer that their request has been received
      const email = await emailService.sendEmail({
        to: input.email,
        from: emailConfig.noRespondEmail,
        subject: "Thanks for your request!",
        data: emailData,
        template: CustomerRequestAcknowledgeEmail,
      });

      return {
        data: email,
        message: "Email sent successfully",
      };
    }),

  emailAcknowledgement: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: requestId }) => {
      const customOrder = await ctx.db.request.findUnique({
        where: { id: requestId },
      });

      if (!customOrder) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Request not found",
        });
      }

      const email = await emailService.sendEmail({
        to: customOrder.email,
        from: emailConfig.noRespondEmail,
        subject: "Thanks for your request!",
        data: {
          firstName: customOrder?.name ?? "Customer",
        },
        template: CustomerRequestAcknowledgeEmail,
      });

      return {
        data: email,
        message: "Email sent successfully",
      };
    }),

  getAll: adminProcedure.input(z.string()).query(({ ctx, input: storeId }) => {
    return ctx.db.request.findMany({
      where: { storeId, archivedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }),

  get: adminProcedure.input(z.string()).query(({ ctx, input: requestId }) => {
    return ctx.db.request.findUnique({
      where: { id: requestId },
      include: {
        items: true,
        payments: true,
        customer: { include: { addresses: true } },
      },
    });
  }),

  getPending: adminProcedure
    .input(z.string())
    .query(({ ctx, input: storeId }) => {
      return ctx.db.request.count({
        where: {
          storeId,
          status: "PENDING",
        },
      });
    }),

  create: adminProcedure
    .input(requestValidator.extend({ storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const customer = await handleCustomer({
        user: undefined,
        email: input.email,
        name: input.name,
      });

      const customOrder = await ctx.db.request.create({
        data: {
          name: input.name,
          email: input.email,
          details: input.details,
          status: input.status,
          notes: input.notes,
          storeId: input.storeId,

          customerId: customer.id,
          items: { createMany: { data: input.items } },
          payments: { createMany: { data: input.payments } },
        },
        include: {
          customer: true,
          items: true,
          payments: true,
        },
      });

      return {
        data: customOrder,
        message: "Request created successfully",
      };
    }),

  update: adminProcedure
    .input(requestValidator.extend({ requestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.requestItem.deleteMany({
        where: { requestId: input.requestId },
      });

      await ctx.db.requestPayment.deleteMany({
        where: { requestId: input.requestId },
      });

      const orderRequest = await ctx.db.request.update({
        where: { id: input.requestId },
        data: {
          name: input.name,
          email: input.email,
          details: input.details,
          status: input.status,
          notes: input.notes,
        },
        include: { items: true, payments: true, customer: true },
      });

      return {
        data: orderRequest,
        message: "Request updated successfully",
      };
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: requestId }) => {
      const request = await ctx.db.request.findUnique({
        where: {
          id: requestId,
          paidInFullAt: null,
          archivedAt: null,
          payments: {
            every: { status: { notIn: ["PAID", "MARKED_AS_PAID"] } },
          },
        },
      });

      if (request) {
        const deletedRequest = await ctx.db.request.delete({
          where: { id: requestId },
        });

        return {
          data: deletedRequest,
          message: "Request deleted successfully",
        };
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Request cannot be deleted. You can archive it instead.",
        });
      }
    }),

  sendQuote: adminProcedure
    .input(
      z.object({
        requestId: z.string(),
        price: z.string(),
        name: z.string(),
        email: z.string(),
        additionalInfo: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const customOrder = await ctx.db.request.findUnique({
        where: { id: input.requestId },
      });

      if (!customOrder) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Request not found",
        });
      }

      const email = await emailService.sendEmail({
        to: input.email,
        from: emailConfig.requestEmail,
        subject: `Quote for your order request #${input.requestId}`,
        data: {
          requestId: input.requestId,
          price: input.price,
          details: customOrder.details,
          additionalInfo: input.additionalInfo,
          name: input.name,
        },
        template: CustomerRequestQuoteEmail,
      });

      return {
        data: email,
        status: 200,
        message: "Quote sent successfully",
      };
    }),

  reject: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: requestId }) => {
      const customOrder = await ctx.db.request.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
        select: { email: true },
      });

      const data = { firstName: "" };

      const email = await emailService.sendEmail({
        to: customOrder.email,
        from: emailConfig.noRespondEmail,
        subject: "Regarding your order request",
        data,
        template: CustomerCustomRejectEmail,
      });

      return {
        data: email,
        status: 200,
        message: "Email Sent",
      };
    }),

  archive: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: requestId }) => {
      const archived = await ctx.db.request.update({
        where: { id: requestId },
        data: { archivedAt: new Date() },
      });

      return {
        data: archived,
        message: "Request archived successfully",
      };
    }),
});

const handleCustomer = async ({
  user,
  email,
  name,
}: {
  user?: string;
  email: string;
  name: string;
}) => {
  let customer;

  if (user) {
    customer = await db.customer.findUnique({
      where: {
        id: user,
      },
    });
  }
  // Find / create a customer given the email
  customer = await db.customer.findUnique({
    where: {
      email: email,
    },
  });

  if (!customer) {
    customer = await db.customer.create({
      data: {
        firstName: name.split(" ")[0] ?? "",
        lastName: name.split(" ")[1] ?? "",
        email: email,
      },
    });
  }

  return customer;
};
