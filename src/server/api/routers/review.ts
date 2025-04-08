import { TRPCError } from "@trpc/server";

import { z } from "zod";
import { reviewValidator } from "~/lib/validators/review";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const reviewRouter = createTRPCRouter({
  create: protectedProcedure
    .input(reviewValidator)
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.db.review.create({
        data: {
          rating: input.rating,
          title: input.title,
          content: input.content,
          user: { connect: { id: input.userId } },
          product: { connect: { id: input.productId } },
          images: {
            createMany: {
              data: input.images.map((url) => ({ url })),
            },
          },
        },
      });

      return {
        data: review,
        message: "Review created successfully",
      };
    }),

  update: protectedProcedure
    .input(reviewValidator.extend({ reviewId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (
        ctx.session.user.id !== input.userId ||
        ctx.session.user.role !== "ADMIN"
      )
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action.",
        });

      const updatedReview = await ctx.db.review.update({
        where: {
          id: input.reviewId,
          userId: input.userId,
        },
        data: {
          rating: input.rating,
          title: input.title,
          content: input.content,
          images: {
            createMany: { data: input.images.map((url) => ({ url })) },
          },
        },
      });

      return {
        data: updatedReview,
        message: "Review updated successfully",
      };
    }),
  delete: protectedProcedure
    .input(z.object({ reviewId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (
        ctx.session.user.id !== input.userId ||
        ctx.session.user.role !== "ADMIN"
      )
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action.",
        });

      const deletedReview = await ctx.db.review.delete({
        where: { id: input.reviewId, userId: input.userId },
      });

      return {
        data: deletedReview,
        message: "Review deleted successfully",
      };
    }),
});
