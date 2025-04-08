import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { storeTheme } from "~/data/config.custom";

import { emailService } from "~/lib/email";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { validateAdmin } from "~/utils/validate-admin";
import { CustomerRequestPayNowEmail } from "../email-templates/customer-requests/customer.request-pay-now";
import {
  type CustomerReceiptEmailData,
  CustomerReceiptEmail,
} from "../email-templates/customer.receipt";
import { emailConfig } from "../email.config";

export const emailServiceRouter = createTRPCRouter({
  sendPaymentLinks: protectedProcedure
    .input(
      z.object({
        email: z.string(),
        name: z.string(),
        additionalInfo: z.string().optional(),
        payments: z.array(
          z.object({
            id: z.string(),
            type: z.string(),
            amount: z.number(),
            providerUrl: z.string().optional().nullish(),
            dueAt: z.date().optional().nullish(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, name, additionalInfo, payments } = input;
      const { session } = ctx;

      validateAdmin(session.user);

      const deposit = payments.find((p) => p.type === "DEPOSIT");
      const normal = payments.find((p) => p.type !== "DEPOSIT");

      await emailService.sendEmail({
        to: email,
        from: emailConfig.requestEmail,
        subject: "Your order request was accepted! Next steps...",
        template: CustomerRequestPayNowEmail,
        data: {
          name,
          additionalInfo,
          depositDueDate: deposit?.dueAt,
          normalDueDate: normal?.dueAt,
          depositLink: deposit?.providerUrl,
          normalLink: normal?.providerUrl ?? "",
        },
      });

      return {
        success: true,
      };
    }),
});
