/* eslint-disable @typescript-eslint/no-unused-vars */
import { getStoreIdViaTRPC } from "~/server/actions/store";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import {
  extractQueryString,
  filterProductsByVariantsAlt,
  parseQueryString,
} from "~/utils/product-filtering";
import { uniqueId } from "lodash";
import { z } from "zod";

import { ProductStatus, ProductType, SaleType } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import type { Product } from "~/types/product";
import { env } from "~/env";
import {
  productFormValidator,
  productValidator,
} from "~/lib/validators/product";

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
      }),
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
              priceInCents: {
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
        products as unknown as Product[],
        results.names,
        results.values,
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
          stock: { gt: 0 },
        },
        include: { product: true },
      });

      return variants;
    }),

  // Queries for the admin
  getAll: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input: storeSlug }) => {
      const storeId = await getStoreIdViaTRPC(storeSlug);

      const products = await ctx.db.product.findMany({
        where: { storeId },
        include: {
          collections: true,
          attributes: true,
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
          _count: {
            select: { variants: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return products;
    }),

  get: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        status: z.nativeEnum(ProductStatus).optional(),
      }),
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

          attributes: true,
          collections: true,

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
    .input(
      productFormValidator
        .extend({ storeId: z.string(), featuredImage: z.string() })
        .omit({ tempFeaturedImage: true, tempImages: true }),
    )
    .mutation(async ({ ctx, input }) => {
      let slug = input.name.toLowerCase().replace(/ /g, "-");
      const checkForUniqueSlug = await ctx.db.product.count({
        where: { slug },
      });

      if (checkForUniqueSlug > 0) slug = `${slug}-${checkForUniqueSlug + 1}`;

      const duplicateSKUs = input.variants
        .filter(
          (variant) =>
            variant.sku !== undefined &&
            variant.sku !== null &&
            variant.sku !== "",
        )
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
          ...input,
          slug,
          collections: {
            connect: input.collections.map((collection) => ({
              id: collection.id,
            })),
          },
          attributes: {
            createMany: {
              data: input.attributes.map((att) => ({
                name: att.name,
                values: att.values,
                storeId: input.storeId,
              })),
            },
          },
          variants: {
            createMany: {
              data: [
                ...input.variants.map((variant) => ({
                  ...variant,
                  sku: variant.sku === "" ? undefined : variant.sku,
                  imageUrl:
                    variant.imageUrl === "" ? undefined : variant.imageUrl,
                })),
              ],
            },
          },
        },
      });

      return {
        data: product,
        message: "Product successfully created",
      };
    }),

  update: adminProcedure
    .input(
      productFormValidator
        .extend({ productId: z.string(), featuredImage: z.string() })
        .omit({ tempFeaturedImage: true, tempImages: true }),
    )
    .mutation(async ({ ctx, input }) => {
      const { productId, variants, collections, ...rest } = input;
      const currentProduct = await ctx.db.product.findUnique({
        where: { id: productId },
        select: { name: true, slug: true, storeId: true, collections: true },
      });

      if (!currentProduct)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Product not found.",
        });

      let slug = currentProduct.slug;

      if (currentProduct.name !== input.name) {
        slug = input.name.toLowerCase().replace(/ /g, "-");
        const checkForUniqueSlug = await ctx.db.product.count({
          where: { slug },
        });

        if (checkForUniqueSlug > 0) slug = `${slug}-${checkForUniqueSlug + 1}`;
      }

      const updatedProduct = await ctx.db.product.update({
        where: { id: productId },
        data: {
          ...rest,
          slug,
          collections: {
            disconnect: currentProduct.collections.map((collection) => ({
              id: collection.id,
            })),
            connect: collections?.map((collection) => ({
              id: collection.id,
            })),
          },
          attributes: {
            deleteMany: {},
            create: input.attributes.map((att) => ({
              name: att.name,
              values: att.values,
              storeId: currentProduct.storeId,
            })),
          },
        },
      });

      /////
      // Normalize SKUs: treat "" as null
      const normalizedVariants = variants.map((v) => ({
        ...v,
        sku: v.sku?.trim() ?? undefined,
      }));

      // Check for duplicate SKUs within the input
      const skus = normalizedVariants
        .map((v) => v.sku)
        .filter((sku): sku is string => !!sku);

      const skuSet = new Set(skus);
      if (skuSet.size !== skus.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "SKUs must be unique when provided.",
        });
      }

      // Check for SKU conflicts with variants from other products
      if (skus.length > 0) {
        const existing = await ctx.db.variation.findMany({
          where: {
            sku: { in: skus },
            productId: { not: productId },
          },
          select: {
            id: true,
            sku: true,
            productId: true,
          },
        });

        if (existing.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `The following SKUs already exist on other products: ${existing
              .map((e) => e.sku)
              .join(", ")}`,
          });
        }
      }

      ////
      const existingVariants = await ctx.db.variation.findMany({
        where: { productId, deletedAt: null },
        select: { id: true },
      });

      const existingIds = new Set(existingVariants.map((v) => v.id));
      const incomingIds = new Set(normalizedVariants.map((v) => v.id));

      // Upsert all variants (create or update)
      const upserts = normalizedVariants.map((v) =>
        ctx.db.variation.upsert({
          where: { id: v.id },
          update: {
            name: v.name,
            priceInCents: v.priceInCents,
            sku: v.sku === "" ? undefined : v.sku,
            imageUrl: v.imageUrl === "" ? undefined : v.imageUrl,
            stock: v.stock,
            manageStock: v.manageStock,
            values: v.values,
          },
          create: {
            id: v.id,
            name: v.name,
            priceInCents: v.priceInCents,
            sku: v.sku === "" ? undefined : v.sku,
            imageUrl: v.imageUrl === "" ? undefined : v.imageUrl,
            stock: v.stock,
            manageStock: v.manageStock,
            values: v.values,
            productId: input.productId,
          },
        }),
      );

      // Soft delete any that were removed
      const deletes = [...existingIds]
        .filter((id) => !incomingIds.has(id))
        .map((id) =>
          ctx.db.variation.update({
            where: { id },
            data: { deletedAt: new Date() },
          }),
        );

      await ctx.db.$transaction([...upserts, ...deletes]);

      // const filteredVariants = variants.filter(
      //   (variant) => !!variant.sku,
      // );

      // const existingVariantSkus = await ctx.db.variation.count({
      //   where: { sku: { in: filteredVariants.map((variant) => variant.sku!) } },
      // });

      // if (existingVariantSkus > 0) {
      //   throw new TRPCError({
      //     code: "BAD_REQUEST",
      //     message: "Duplicate SKUs found.",
      //   });
      // }

      // const { productId, ...rest } = input;

      // // Fetch existing variants to determine which ones to mark as deleted
      // const existingVariants = await ctx.db.variation.findMany({
      //   where: { productId },
      // });

      // const variantIdsToDelete = existingVariants
      //   .filter(
      //     (existingVariant) =>
      //       !input.variants.some(
      //         (variant) => variant.id === existingVariant.id,
      //       ),
      //   )
      //   .map((variant) => variant.id);

      // // Mark variants as deleted if they are associated with orderItems
      // await ctx.db.variation.updateMany({
      //   where: {
      //     id: { in: variantIdsToDelete },
      //     orderItems: { some: {} },
      //   },
      //   data: { deletedAt: new Date() },
      // });

      // // Delete variants that are not associated with orderItems
      // await ctx.db.variation.deleteMany({
      //   where: {
      //     id: { in: variantIdsToDelete },
      //     orderItems: { none: {} },
      //   },
      // });

      // });

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

  // search: publicProcedure
  //   .input(
  //     z.object({
  //       queryString: z.string(),
  //       storeId: z.string(),
  //     }),
  //   )
  //   .query(async ({ ctx, input: { queryString, storeId } }) => {
  //     if (queryString === "") return [];

  //     const products = await ctx.db.product.findMany({
  //       where: {
  //         storeId,
  //         OR: [
  //           { name: { contains: queryString } },
  //           { description: { contains: queryString } },
  //           { tags: { has: queryString } },
  //           { materials: { has: queryString } },
  //           { collections: { some: { name: { contains: queryString } } } },
  //         ],
  //       },
  //       include: { collections: true },
  //       orderBy: { createdAt: "desc" },
  //     });

  //     return products;
  //   }),

  duplicate: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: productId }) => {
      const product = await ctx.db.product.findUnique({
        where: { id: productId },
        omit: { id: true },
        include: {
          attributes: { select: { name: true, values: true } },
          collections: { select: { id: true } },
          variants: {
            select: {
              name: true,
              sku: true,
              imageUrl: true,
              priceInCents: true,
              stock: true,
              manageStock: true,
              values: true,
            },
          },
        },
      });
      if (!product)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Product not found.",
        });

      const { attributes, variants, collections, ...rest } = product;

      const duplicateProduct = await ctx.db.product.create({
        data: {
          ...rest,
          name: `${product.name} (Copy)`,
          slug: `${product.slug}-${new Date().getTime()}`,
          status: ProductStatus.DRAFT,
          additionalInfo: product?.additionalInfo ?? undefined,
          collections: {
            connect: collections.map((collection) => ({ id: collection.id })),
          },
          variants: {
            createMany: {
              data: variants.map((variant) => ({
                ...variant,
                sku: variant.sku ? `${variant.sku} (Copy)` : undefined,
              })),
            },
          },
        },
      });

      await ctx.db.attribute.createMany({
        data: attributes.map((att) => ({
          name: att.name,
          values: att.values,
          productId: duplicateProduct.id,
          storeId: duplicateProduct.storeId,
        })),
      });

      return {
        data: duplicateProduct,
        message: "Product successfully duplicated",
      };
    }),

  // archive: adminProcedure
  //   .input(z.string())
  //   .mutation(async ({ ctx, input: productId }) => {
  //     const product = await ctx.db.product.update({
  //       where: { id: productId },
  //       data: { status: ProductStatus.ARCHIVED, deletedAt: new Date() },
  //     });

  //     return {
  //       data: product,
  //       message: "Product successfully archived",
  //     };
  //   }),
});
