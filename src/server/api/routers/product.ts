/* eslint-disable @typescript-eslint/no-unused-vars */
import { ProductStatus, ProductType, SaleType } from "@prisma/client";

import { TRPCError } from "@trpc/server";
import { uniqueId } from "lodash";
import { z } from "zod";
import { env } from "~/env.mjs";
import { productValidator } from "~/lib/validators/product";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

import {
  extractQueryString,
  filterProductsByVariantsAlt,
  parseQueryString,
} from "~/utils/filtering";

export const productsRouter = createTRPCRouter({
  // Queries for the frontend
  getAllValid: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        queryString: z.string().optional(),
        isFeatured: z.boolean().optional(),
        filter: z
          .object({
            sort: z.string().optional(),
            price: z.string().optional(),
            color: z
              .enum(["beige", "blue", "green", "purple", "white"])
              .optional(),
            size: z.enum(["S", "M", "L"]).optional(),
          })
          .optional(),
        test: z.record(z.string(), z.array(z.string())).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const results = extractQueryString(input.queryString ?? "");

      const parsedResults = parseQueryString(input.queryString ?? "");

      const [priceRangeMin, priceRangeMax] = parsedResults?.range
        ? ((parsedResults.range as string).split(",") as [string, string])
        : [undefined, undefined];

      const collectionIds = parsedResults?.collection
        ? [parsedResults.collection as string[]]?.flatMap((id) => id)
        : undefined;

      const products = await ctx.db.product.findMany({
        where: {
          storeId: input.storeId,
          status: "ACTIVE",
          isFeatured: input.isFeatured ?? undefined,
          ...(collectionIds
            ? { collections: { some: { id: { in: collectionIds } } } }
            : {}),
          variants: {
            some: {
              price: {
                gte:
                  priceRangeMin === undefined
                    ? 0
                    : (parseInt(priceRangeMin) ?? 0) * 100,
                lt:
                  priceRangeMax === undefined
                    ? 100000
                    : (parseInt(priceRangeMax) ?? 100000) * 100,
              },
            },
          },
        },
        include: {
          infoSections: true,
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
          sales: {
            where: {
              isActive: true,
              variant: SaleType.STANDARD,
              AND: [
                { OR: [{ startsAt: { lte: new Date() } }, { startsAt: null }] },
                { OR: [{ endsAt: { gte: new Date() } }, { endsAt: null }] },
              ],
            },
            include: {
              products: { select: { id: true } },
              collections: { select: { id: true } },
            },
            orderBy: { endsAt: "desc" },
          },

          collections: true,
          variants: true,
          attributes: true,
          images: true,
          store: {
            select: {
              id: true,
              hasFlatRate: true,
              flatRateAmount: true,
              hasFreeShipping: true,
              minFreeShipping: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const filteredProductsAlt = filterProductsByVariantsAlt(
        products,
        results.names,
        results.values
      );

      // if(!input.test)
      return input.queryString ? filteredProductsAlt : products;
    }),

  getVariants: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: storeId }) => {
      const variants = await ctx.db.variation.findMany({
        where: {
          product: { storeId },
          quantity: { gt: 0 },
        },
        include: { product: true },
      });

      return variants;
    }),

  // Queries for the admin
  getAll: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        isFeatured: z.boolean().optional(),
        collectionId: z.string().optional(),
        isArchived: z.boolean().optional(),
        includeCustom: z.boolean().optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.db.product.findMany({
        where: {
          storeId: input.storeId ?? env.NEXT_PUBLIC_STORE_ID,
          isFeatured: input.isFeatured ?? undefined,
          NOT: { status: "CUSTOM" },
          collections: input.collectionId
            ? { some: { id: input.collectionId ?? undefined } }
            : {},
        },
        include: {
          collections: true,
          attributes: true,
          images: true,
          variants: true,
          store: true,
          reviews: {
            orderBy: { createdAt: "desc" },
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
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  get: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        status: z.nativeEnum(ProductStatus).optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.db.product.findUnique({
        where: { id: input.productId, status: input.status },
        include: {
          store: {
            select: {
              id: true,
              hasFlatRate: true,
              hasFreeShipping: true,
              flatRateAmount: true,
              minFreeShipping: true,
            },
          },
          infoSections: true,
          attributes: true,
          collections: true,
          images: true,
          sales: {
            where: {
              isActive: true,
              // variant: SaleType.STANDARD,
              AND: [
                { OR: [{ startsAt: { lte: new Date() } }, { startsAt: null }] },
                { OR: [{ endsAt: { gte: new Date() } }, { endsAt: null }] },
              ],
            },
            include: {
              products: { select: { id: true } },
              collections: { select: { id: true } },
            },
            orderBy: { endsAt: "desc" },
          },

          reviews: {
            orderBy: { createdAt: "desc" },
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
          _count: {
            select: { variants: { where: { orderItems: { some: {} } } } },
          },
          variants: { where: { deletedAt: null } },
        },
      });
    }),

  create: adminProcedure
    .input(productValidator.extend({ storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { slug, ...rest } = input;

      const formattedSlug = slug
        ? slug
        : input.name.toLowerCase().replace(/ /g, "-");

      const checkForUniqueSlug = await ctx.db.product.count({
        where: { slug: formattedSlug },
      });

      const duplicateSKUs = input.variants
        .filter((variant) => variant.sku !== undefined)
        .map((variant) => variant.sku!);

      const checkForDuplicateSKUs = await ctx.db.variation.count({
        where: { sku: { in: duplicateSKUs } },
      });

      if (checkForDuplicateSKUs > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Duplicate SKUs found. Please make sure SKUs are unique, then try again.",
        });
      }

      const product = await ctx.db.product.create({
        data: {
          ...rest,
          tags: input.tags.map((tag) => tag.name),
          materials: input.materials.map((materials) => materials.name),
          attributes: {
            connect: input.attributes.map((att) => ({ id: att.id })),
          },
          images: {
            createMany: { data: input.images.map((url) => ({ url })) },
          },
          infoSections: {
            createMany: {
              data: input.infoSections.map((section) => ({
                title: section.title,
                description: section.description,
              })),
            },
          },
          variants: {
            createMany: {
              data: [
                ...input.variants.map((variant) => ({
                  ...variant,
                  sku: variant.sku === "" ? null : variant.sku,
                  imageUrl: variant.imageUrl === "" ? null : variant.imageUrl,
                })),
              ],
            },
          },
          slug:
            checkForUniqueSlug > 0
              ? `${formattedSlug}-${uniqueId().slice(0, 3)}`
              : formattedSlug,
        },
      });

      return {
        data: product,
        message: "Product successfully created",
      };
    }),

  update: adminProcedure
    .input(productValidator.extend({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const slugProduct = await ctx.db.product.findUnique({
        where: { id: input.productId },
        select: {
          name: true,
          slug: true,
        },
      });

      if (!slugProduct)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Product not found.",
        });

      let slug = slugProduct.slug;

      if (slugProduct.name !== input.name) {
        slug = input.name.toLowerCase().replace(/ /g, "-");
        // Ensure the slug is unique by appending a number if necessary
        let unique = false;
        let suffix = 1;
        while (!unique) {
          const slugToCheck: string = suffix > 1 ? `${slug}-${suffix}` : slug;
          const existingSlug = await ctx.db.product.findUnique({
            where: { slug: slugToCheck },
          });
          if (!existingSlug) {
            unique = true;
            slug = slugToCheck;
          } else {
            suffix++;
          }
        }
      }

      const filteredVariants = input.variants.filter(
        (variant) => !!variant.sku
      );

      const existingVariantSkus = await ctx.db.variation.count({
        where: {
          sku: {
            in: filteredVariants.map((variant) => variant.sku!),
          },
        },
      });

      if (existingVariantSkus > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Duplicate SKUs found.",
        });
      }

      const { productId, ...rest } = input;

      // Fetch existing variants to determine which ones to mark as deleted
      const existingVariants = await ctx.db.variation.findMany({
        where: { productId },
      });

      const variantIdsToDelete = existingVariants
        .filter(
          (existingVariant) =>
            !input.variants.some((variant) => variant.id === existingVariant.id)
        )
        .map((variant) => variant.id);

      // Mark variants as deleted if they are associated with orderItems
      await ctx.db.variation.updateMany({
        where: {
          id: { in: variantIdsToDelete },
          orderItems: { some: {} },
        },
        data: { deletedAt: new Date() },
      });

      // Delete variants that are not associated with orderItems
      await ctx.db.variation.deleteMany({
        where: {
          id: { in: variantIdsToDelete },
          orderItems: { none: {} },
        },
      });

      const updatedProduct = await ctx.db.product.update({
        where: {
          id: productId,
        },
        data: {
          ...rest,
          slug,
          attributes: {
            connect: input.attributes.map((att) => ({ id: att.id })),
          },
          images: {
            deleteMany: {},
            createMany: {
              data: input.images.map((url) => ({ url })),
            },
          },
          variants: {
            upsert: input.variants.map((variant) => ({
              where: { id: variant.id },
              update: {
                ...variant,
                sku: variant.sku === "" ? null : variant.sku,
                imageUrl: variant.imageUrl === "" ? null : variant.imageUrl,
              },
              create: {
                sku: variant.sku === "" ? null : variant.sku,
                imageUrl: variant.imageUrl === "" ? null : variant.imageUrl,
                price: variant.price,
                quantity: variant.quantity,
                name: variant.name,
                values: variant.values,
              },
            })),
          },
          deletedAt:
            input.status === ProductStatus.ARCHIVED ? new Date() : undefined,
          tags: input.tags.map((tag) => tag.name),
          materials: input.materials.map((materials) => materials.name),
          infoSections: {
            deleteMany: {},
            createMany: {
              data: input.infoSections.map((section) => ({
                title: section.title,
                description: section.description,
              })),
            },
          },
        },
      });

      return {
        data: updatedProduct,
        message: "Product successfully updated",
      };
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: id }) => {
      const orderItems = await ctx.db.orderItem.count({
        where: { variant: { productId: id } },
      });

      if (orderItems > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "The product is associated with an order item. It cannot be deleted.",
        });
      }

      const product = await ctx.db.product.delete({ where: { id } });

      return {
        data: product,
        message: "Product successfully deleted",
      };
    }),

  search: publicProcedure
    .input(
      z.object({
        queryString: z.string(),
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input: { queryString, storeId } }) => {
      if (queryString === "") return [];

      const products = await ctx.db.product.findMany({
        where: {
          storeId,
          OR: [
            { name: { contains: queryString } },
            { description: { contains: queryString } },
            { tags: { has: queryString } },
            { materials: { has: queryString } },
            { collections: { some: { name: { contains: queryString } } } },
          ],
        },
        include: { collections: true },
        orderBy: { createdAt: "desc" },
      });

      return products;
    }),

  duplicate: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: productId }) => {
      const product = await ctx.db.product.findUnique({
        where: { id: productId },
        include: {
          infoSections: true,
          attributes: true,
          images: true,
          variants: true,
        },
      });

      if (!product)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Product not found.",
        });

      const {
        id: ignoreId,
        infoSections,
        attributes,
        images,
        variants,
        ...rest
      } = product;

      const duplicateProduct = await ctx.db.product.create({
        data: {
          ...rest,
          name: `${product.name} (Copy)`,
          slug: `${product.slug}-copy`,
          status: ProductStatus.DRAFT,
          infoSections: {
            createMany: {
              data: infoSections.map((section) => ({
                title: section.title,
                description: section.description,
              })),
            },
          },
          attributes: {
            connect: attributes.map((att) => ({ id: att.id })),
          },
          images: {
            createMany: {
              data: images.map((image) => ({ url: image.url })),
            },
          },
          variants: {
            createMany: {
              data: variants.map((variant) => ({
                name: `${variant.name} (Copy)`,
                sku: `${variant.sku} (Copy)`,
                imageUrl: variant.imageUrl,
                price: variant.price,
                quantity: variant.quantity,
                values: variant.values,
              })),
            },
          },
        },
      });

      return {
        data: duplicateProduct,
        message: "Product successfully duplicated",
      };
    }),
});
