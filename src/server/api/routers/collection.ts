import { getStoreIdViaTRPC } from "~/server/actions/store";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

import { SaleType } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import {
  collectionFormValidator,
  collectionValidator,
} from "~/lib/validators/collection";

export const collectionsRouter = createTRPCRouter({
  getAllReduced: publicProcedure
    .input(
      z.object({ storeId: z.string(), isFeatured: z.boolean().optional() }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.collection.findMany({
        where: {
          storeId: input.storeId,
          isFeatured: input.isFeatured,
        },

        select: {
          id: true,
          storeId: true,
          name: true,
          slug: true,
          imageUrl: true,
          products: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return data;
    }),

  getAllValid: publicProcedure
    .input(
      z.object({ storeId: z.string(), isFeatured: z.boolean().optional() }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.collection.findMany({
        where: {
          storeId: input.storeId,
          isFeatured: input.isFeatured,
        },
        include: {
          products: {
            include: {
              variants: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getAll: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input: storeSlug }) => {
      const storeId = await getStoreIdViaTRPC(storeSlug);

      const collections = await ctx.db.collection.findMany({
        where: { storeId },
        include: { products: true },
        orderBy: { createdAt: "desc" },
      });
      return collections;
    }),
  search: publicProcedure
    .input(z.object({ queryString: z.string(), storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (input.queryString === "") return [];

      const collections = await ctx.db.collection.findMany({
        where: {
          storeId: input.storeId,
          OR: [
            { name: { contains: input.queryString, mode: "insensitive" } },

            {
              description: { contains: input.queryString, mode: "insensitive" },
            },
            {
              products: {
                some: {
                  name: { contains: input.queryString, mode: "insensitive" },
                },
              },
            },
          ],
        },
        include: { products: true },
        orderBy: { createdAt: "desc" },
      });

      return collections;
    }),

  get: adminProcedure
    .input(z.string())
    .query(({ ctx, input: collectionId }) => {
      return ctx.db.collection.findUnique({
        where: { id: collectionId },
        include: { products: true },
      });
    }),

  create: adminProcedure
    .input(
      collectionFormValidator
        .extend({ storeId: z.string() })
        .omit({ tempImageUrl: true }),
    )
    .mutation(async ({ ctx, input }) => {
      let slug = input.name.toLowerCase().replace(/ /g, "-");
      const checkForUniqueSlug = await ctx.db.collection.count({
        where: { slug },
      });

      if (checkForUniqueSlug > 0) slug = `${slug}-${checkForUniqueSlug + 1}`;

      const collection = await ctx.db.collection.create({
        data: {
          ...input,
          slug,
          products: { connect: input.products },
        },
      });

      return {
        data: collection,
        message: "Collection created successfully",
      };
    }),

  update: adminProcedure
    .input(collectionFormValidator.extend({ collectionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { products, collectionId, ...rest } = input;

      const currentCollection = await ctx.db.collection.findUnique({
        where: { id: collectionId },
        select: { name: true, slug: true, storeId: true, products: true },
      });

      if (!currentCollection)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Collection not found.",
        });

      let slug = currentCollection.slug;

      if (currentCollection.name !== input.name) {
        slug = input.name.toLowerCase().replace(/ /g, "-");
        const checkForUniqueSlug = await ctx.db.collection.count({
          where: { slug },
        });

        if (checkForUniqueSlug > 0) slug = `${slug}-${checkForUniqueSlug + 1}`;
      }

      const collection = await ctx.db.collection.update({
        where: { id: collectionId },
        data: {
          ...rest,
          slug,
          products: {
            disconnect: currentCollection.products.map((product) => ({
              id: product.id,
            })),
            connect: products.map((product) => ({ id: product.id })),
          },
        },
      });

      return {
        data: collection,
        message: "Collection updated successfully",
      };
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: collectionId }) => {
      const collection = await ctx.db.collection.delete({
        where: { id: collectionId },
      });

      return {
        data: collection,
        message: "Collection deleted successfully",
      };
    }),

  duplicate: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: collectionId }) => {
      const collection = await ctx.db.collection.findUnique({
        where: { id: collectionId },
        include: {
          products: true,
        },
        omit: {
          createdAt: true,
          updatedAt: true,
          id: true,
        },
      });

      if (!collection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collection not found",
        });
      }

      const { products, ...rest } = collection;

      const duplicatedCollection = await ctx.db.collection.create({
        data: {
          ...rest,
          storeId: collection.storeId,
          name: `${collection.name} (Copy)`,
          slug: `${collection.slug}-${new Date().getTime()}`,
          status: "DRAFT",
          products: {
            connect: products.map((product) => ({ id: product.id })),
          },
        },
      });

      return {
        data: duplicatedCollection,
        message: "Collection duplicated successfully",
      };
    }),
});
