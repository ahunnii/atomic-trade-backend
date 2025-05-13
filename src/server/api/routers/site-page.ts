/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { z } from "zod";

import type { InputJsonValue } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";

import { sitePageFormValidator } from "~/lib/validators/site-page";

export const sitePageRouter = createTRPCRouter({
  get: adminProcedure.input(z.string()).query(({ ctx, input: sitePageId }) => {
    return ctx.db.sitePage.findUnique({
      where: { id: sitePageId },
    });
  }),

  getAll: adminProcedure.input(z.string()).query(({ ctx, input: storeId }) => {
    return ctx.db.sitePage.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: adminProcedure
    .input(
      sitePageFormValidator.extend({
        storeId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let slug = input.title.toLowerCase().replace(/ /g, "-");
      const checkForUniqueSlug = await ctx.db.sitePage.count({
        where: { slug },
      });

      if (checkForUniqueSlug > 0) slug = `${slug}-${checkForUniqueSlug + 1}`;

      const sitePage = await ctx.db.sitePage.create({
        data: {
          ...input,
          storeId: input.storeId,
          slug,
          content: input.content ?? null,
        },
      });

      return {
        data: sitePage,
        message: "Site page created successfully",
      };
    }),

  update: adminProcedure
    .input(
      sitePageFormValidator.extend({
        sitePageId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { sitePageId, ...rest } = input;
      const currentBlogPost = await ctx.db.sitePage.findUnique({
        where: { id: input.sitePageId },
        select: { title: true, slug: true, storeId: true },
      });

      if (!currentBlogPost)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Blog post not found",
        });

      let slug = currentBlogPost.slug;

      if (currentBlogPost.title !== input.title) {
        slug = input.title.toLowerCase().replace(/ /g, "-");
        const checkForUniqueSlug = await ctx.db.sitePage.count({
          where: { slug },
        });

        if (checkForUniqueSlug > 0) slug = `${slug}-${checkForUniqueSlug + 1}`;
      }

      const sitePage = await ctx.db.sitePage.update({
        where: { id: sitePageId },
        data: {
          ...rest,
          slug,
          content: input.content ?? null,
        },
      });

      return {
        data: sitePage,
        message: "Site page updated successfully",
      };
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: sitePageId }) => {
      const sitePage = await ctx.db.sitePage.delete({
        where: { id: sitePageId },
      });

      return {
        data: sitePage,
        message: "Site page deleted successfully",
      };
    }),

  duplicate: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: sitePageId }) => {
      const sitePage = await ctx.db.sitePage.findUnique({
        where: { id: sitePageId },
      });

      if (!sitePage)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Site page not found",
        });

      const newSitePage = await ctx.db.sitePage.create({
        data: {
          storeId: sitePage.storeId,
          title: sitePage.title,
          content: sitePage.content as InputJsonValue,
          slug: `${sitePage.slug}-${new Date().getTime()}`,
        },
      });

      return {
        data: newSitePage,
        message: "Site page duplicated successfully",
      };
    }),
});
