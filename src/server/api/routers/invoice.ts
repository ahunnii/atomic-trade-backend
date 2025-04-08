import { TRPCError } from "@trpc/server";

import { z } from "zod";

import { env } from "~/env.mjs";
import { emailService } from "~/lib/email";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

import { CustomOrderAcceptEmail } from "~/lib/email/email-templates/customer.custom-order-accept";

import { emailConfig } from "~/lib/email/email.config";

import { LineItemType } from "@prisma/client";

import { invoiceValidator } from "~/lib/validators/invoice";

export const invoiceRouter = createTRPCRouter({
  getAll: adminProcedure.input(z.string()).query(({ ctx, input: storeId }) => {
    return ctx.db.invoice.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });
  }),

  get: adminProcedure.input(z.string()).query(({ ctx, input: invoiceId }) => {
    return ctx.db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        request: {
          include: {
            customer: true,
            invoices: true,
          },
        },
        customer: true,
        store: true,
        items: true,
      },
    });
  }),

  create: adminProcedure
    .input(
      invoiceValidator.extend({
        requestId: z.string().optional(),
        storeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const invoices = await Promise.all(
        input.payments.map(async (invoice) => {
          const total = input.lineItems.reduce(
            (acc, item) => acc + item.totalPrice,
            0
          );

          const items: {
            unitPrice: number;
            totalPrice: number;
            description: string;
            notes?: string;
            quantity: number;
            type: LineItemType;
          }[] = [];

          if (invoice.type === "DEPOSIT") {
            items.push({
              unitPrice: invoice.amount,
              totalPrice: invoice.amount,
              description: `Deposit of ${invoice.amount} `,
              notes: `For items ${
                input?.lineItems[0]?.description ?? "Custom Item"
              }${
                input?.lineItems?.length > 0 &&
                ` and ${input.lineItems.length} more`
              }`,
              quantity: 1,
              type: LineItemType.WRITE_IN,
            });
          } else {
            items.push(
              ...input.lineItems.map((item) => ({
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                description: item.description,
                quantity: item.quantity,

                type: item.productId
                  ? LineItemType.PRODUCT
                  : LineItemType.CUSTOM_ITEM,
              }))
            );
          }

          const newInvoice = await ctx.db.invoice.create({
            data: {
              storeId: input.storeId,
              status: input.status,
              type: invoice.type,
              requestId: input.requestId ?? undefined,
              amount: invoice.amount,
              remainingAmount: total - invoice.amount,

              dueAt: invoice.dateDue,
              customerId: input.customerId,

              items: { createMany: { data: items } },
            },
          });

          return newInvoice;
        })
      );
      //Create a draft order for this request
      await ctx.db.order.create({
        data: {
          storeId: input.storeId,
          paymentStatus: "DRAFT",
          fulfillmentStatus: "DRAFT",
          paymentMethod: "INVOICE",
          email: input.email,
          customerId: input.customerId,
          shippingAddress: {
            create: {
              name: input.name,
              street: input.street,
              city: input.city,
              state: input.state,
              postal_code: input.zip,
              country: input.country,
            },
          },

          invoices: {
            connect: invoices.map((invoice) => ({ id: invoice.id })),
          },

          subtotal: invoices.reduce((acc, invoice) => acc + invoice.amount, 0),
          total: invoices.reduce((acc, invoice) => acc + invoice.amount, 0),

          orderItems: {
            createMany: {
              data: input.lineItems.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                price: item.totalPrice,
                productId: item.productId ?? undefined,
                requestId: input.requestId ?? undefined,
              })),
            },
          },
        },
      });

      return {
        data: invoices,
        message: "Invoice created successfully",
      };
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: invoiceId }) => {
      const invoice = await ctx.db.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (invoice?.status !== "DRAFT") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice is already active",
        });
      }

      const deletedInvoice = await ctx.db.invoice.delete({
        where: { id: invoiceId },
      });

      return {
        data: deletedInvoice,
        message: "Invoice deleted successfully",
      };
    }),

  sendViaEmail: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: invoiceId }) => {
      const invoice = await ctx.db.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          request: true,
          items: true,
          customer: true,
          store: { select: { name: true } },
        },
      });

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      }

      const emailData = {
        name: env.NEXT_PUBLIC_STORE_NAME,
        customerName: `${invoice?.customer.firstName} ${invoice?.customer.lastName}`,
        email: invoice?.customer.email ?? "",

        productLink: `${invoice?.providerUrl}`,
        invoiceId: invoice.id,

        product: "Something",
        price: "",
        total: "",
        dueDate: invoice?.dueAt?.toDateString() ?? "N/A",
        notes: "",

        lineItems: invoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
        })),
      };

      const email = await emailService.sendEmail({
        to: invoice.customer.email ?? "",
        from: emailConfig.noRespondEmail,
        subject: `New Invoice from ${invoice.store.name}`,
        data: emailData,
        template: CustomOrderAcceptEmail,
      });

      return {
        data: email,
        status: 200,
        message: "Email Sent",
      };
    }),
});
