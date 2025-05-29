/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getStoreIdViaTRPC } from "~/server/actions/store";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { z } from "zod";

import type { InputJsonValue } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";

import { blogPostFormValidator } from "~/lib/validators/blog";

export const blogRouter = createTRPCRouter({
  get: adminProcedure.input(z.string()).query(({ ctx, input: blogPostId }) => {
    return ctx.db.blogPost.findUnique({
      where: { id: blogPostId },
    });
  }),

  getAll: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input: storeSlug }) => {
      const storeId = await getStoreIdViaTRPC(storeSlug);

      return ctx.db.blogPost.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
      });
    }),

  create: adminProcedure
    .input(
      blogPostFormValidator.extend({
        storeId: z.string(),
        tags: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let slug = input.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");

      const checkForUniqueSlug = await ctx.db.blogPost.count({
        where: { slug },
      });

      if (checkForUniqueSlug > 0) slug = `${slug}-${checkForUniqueSlug + 1}`;

      const blogPost = await ctx.db.blogPost.create({
        data: {
          ...input,
          storeId: input.storeId,
          slug,
          content: input.content ?? null,
        },
      });

      return {
        data: blogPost,
        message: "Blog post created successfully",
      };
    }),

  update: adminProcedure
    .input(
      blogPostFormValidator.extend({
        blogPostId: z.string(),
        tags: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { blogPostId, ...rest } = input;
      const currentBlogPost = await ctx.db.blogPost.findUnique({
        where: { id: input.blogPostId },
        select: { title: true, slug: true, storeId: true },
      });

      if (!currentBlogPost)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Blog post not found",
        });

      let slug = currentBlogPost.slug;

      if (currentBlogPost.title !== input.title) {
        slug = input.title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-");

        const checkForUniqueSlug = await ctx.db.product.count({
          where: { slug },
        });

        if (checkForUniqueSlug > 0) slug = `${slug}-${checkForUniqueSlug + 1}`;
      }

      const blogPost = await ctx.db.blogPost.update({
        where: { id: blogPostId },
        data: {
          ...rest,
          slug,
          content: input.content ?? null,
        },
      });

      return {
        data: blogPost,
        message: "Blog post updated successfully",
      };
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: blogPostId }) => {
      const blogPost = await ctx.db.blogPost.delete({
        where: { id: blogPostId },
      });

      return {
        data: blogPost,
        message: "Blog post deleted successfully",
      };
    }),

  duplicate: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: blogPostId }) => {
      const blogPost = await ctx.db.blogPost.findUnique({
        where: { id: blogPostId },
      });

      if (!blogPost)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Blog post not found",
        });

      const newBlogPost = await ctx.db.blogPost.create({
        data: {
          storeId: blogPost.storeId,
          title: blogPost.title,
          content: blogPost.content as InputJsonValue,
          tags: blogPost.tags,
          cover: blogPost.cover,
          slug: `${blogPost.slug}-${new Date().getTime()}`,
        },
      });

      return {
        data: newBlogPost,
        message: "Blog post duplicated successfully",
      };
    }),
});
