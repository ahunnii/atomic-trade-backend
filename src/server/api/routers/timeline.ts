import { z } from "zod";
import { timelineEntryValidator } from "~/lib/validators/timeline";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

export const timelineRouter = createTRPCRouter({
  create: adminProcedure
    .input(timelineEntryValidator)
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.update({
        where: { id: input.orderId },
        data: {
          timeline: {
            create: {
              title: input.title,
              description: input.description,
              createdAt: new Date(),
              isEditable: true,
            },
          },
        },
        include: { timeline: true },
      });

      return {
        data: order,
        message: "Timeline entry created",
      };
    }),

  update: adminProcedure
    .input(
      timelineEntryValidator.extend({
        timelineId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const timelineEntry = await ctx.db.timeLineEntry.update({
        where: { id: input.timelineId },
        data: {
          title: input.title,
          description: input.description,
        },
      });

      return {
        data: timelineEntry,
        message: "Timeline entry updated",
      };
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: timelineEntryId }) => {
      const entry = await ctx.db.timeLineEntry.delete({
        where: { id: timelineEntryId },
      });

      return {
        data: entry,
        message: "Timeline entry deleted",
      };
    }),
});
