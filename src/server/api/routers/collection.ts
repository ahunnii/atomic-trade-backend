import { TRPCError } from "@trpc/server";

import { z } from "zod";
import { collectionValidator } from "~/lib/validators/collection";

import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

import { SaleType } from "@prisma/client";
import { getOrCreateSlug, getUniqueSlug } from "~/utils/handle-slug-creation";

export const collectionsRouter = createTRPCRouter({
  getAllReduced: publicProcedure
    .input(
      z.object({ storeId: z.string(), isFeatured: z.boolean().optional() })
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

  getAll: publicProcedure
    .input(
      z.object({ storeId: z.string(), isFeatured: z.boolean().optional() })
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
              images: true,
              variants: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
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

  get: publicProcedure
    .input(z.string())
    .query(({ ctx, input: collectionId }) => {
      return ctx.db.collection.findUnique({
        where: { id: collectionId },
        include: {
          products: {
            include: {
              infoSections: true,
              attributes: true,
              sales: {
                where: {
                  isActive: true,
                  variant: SaleType.STANDARD,
                  OR: [{ endsAt: { gte: new Date() } }, { endsAt: null }],
                },
                include: {
                  products: true,
                  collections: true,
                },
                orderBy: { endsAt: "desc" },
                take: 1,
              },
              reviews: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                    },
                  },
                  images: true,
                },
              },

              images: true,
              variants: true,
              store: true,
            },
          },
        },
      });
    }),

  create: adminProcedure
    .input(collectionValidator.extend({ storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const initSlug = await getUniqueSlug("collection", input.name, ctx.db);

        const collection = await ctx.db.collection.create({
          data: {
            storeId: input.storeId,
            name: input.name,
            description: input.description,
            slug: initSlug,
            imageUrl: input.imageUrl,
            isFeatured: input.isFeatured,
            products: { connect: input.products },
          },
        });

        return {
          data: collection,
          message: "Collection created successfully",
        };
      } catch (e) {
        console.error("Collection Creation Error:", e);

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "An error occurred while creating the collection.",
        });
      }
    }),

  update: adminProcedure
    .input(collectionValidator.extend({ collectionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const slug = await getOrCreateSlug(
          "collection",
          input.collectionId,
          input.name,
          ctx.db
        );

        const collection = await ctx.db.collection.update({
          where: {
            id: input.collectionId,
          },
          data: {
            name: input.name,
            description: input.description,
            isFeatured: input.isFeatured,
            slug: slug,
            imageUrl: input.imageUrl,
            products: { set: [] },
          },
        });

        const updatedCollection = await ctx.db.collection.update({
          where: { id: collection.id },
          data: { products: { connect: input.products } },
        });

        return {
          data: updatedCollection,
          message: "Collection updated successfully",
        };
      } catch (error) {
        console.error(error);

        if ((error as { code: string })?.code === "P2002") {
          // Db's error code for unique constraint
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Name: A product collection with this name already exists.",
          });
        }

        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "An error occurred while updating the collection. Please try again.",
        });
      }
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
          sales: true,
          coupons: true,
        },
      });

      if (!collection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collection not found",
        });
      }

      const initSlug = await getUniqueSlug(
        "collection",
        collection.name,
        ctx.db
      );

      const duplicatedCollection = await ctx.db.collection.create({
        data: {
          storeId: collection.storeId,
          name: `${collection.name} (Copy)`,
          description: collection.description,
          slug: initSlug,
          imageUrl: collection.imageUrl,
          isFeatured: collection.isFeatured,
          products: {
            connect: collection.products.map((product) => ({ id: product.id })),
          },
        },
      });

      return {
        data: duplicatedCollection,
        message: "Collection duplicated successfully",
      };
    }),
});
