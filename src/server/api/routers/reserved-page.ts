/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getStoreIdViaTRPC } from "~/server/actions/store";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { policiesValidator } from "~/lib/validators/policy";
import { reservedPageValidator } from "~/lib/validators/reserved-page";

export const reservedPageRouter = createTRPCRouter({
  get: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input: storeSlug }) => {
      const storeId = await getStoreIdViaTRPC(storeSlug);

      return ctx.db.store.findUnique({
        where: { id: storeId },
        select: { reservedSitePages: true },
      });
    }),

  update: adminProcedure
    .input(
      reservedPageValidator.extend({
        storeId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { storeId, ...rest } = input;

      const currentBlogPost = await ctx.db.store.findUnique({
        where: { id: storeId },
        select: { reservedSitePages: true },
      });

      if (!currentBlogPost)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Blog post not found",
        });

      const sitePage = await ctx.db.reservedSitePages.upsert({
        where: { id: currentBlogPost.reservedSitePages?.id ?? "" },
        create: { ...rest, storeId },
        update: { ...rest },
      });

      return {
        data: sitePage,
        message: "Reserved site pages updated successfully",
      };
    }),
});
