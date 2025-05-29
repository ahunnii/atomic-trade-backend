import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { homepageSettingsValidator } from "~/lib/validators/settings";
import {
  brandingSettingsValidator,
  shippingSettingsValidator,
  storeValidator,
} from "~/lib/validators/store";

export const storeRouter = createTRPCRouter({
  getId: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input: storeSlug }) => {
      const store = await ctx.db.store.findUnique({
        where: { slug: storeSlug },
        select: { id: true, slug: true },
      });

      return store;
    }),

  getBySlug: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input: storeSlug }) => {
      const store = await ctx.db.store.findUnique({
        where: { slug: storeSlug },
        include: { address: true },
      });

      return store;
    }),

  get: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input: storeId }) => {
      const store = await ctx.db.store.findUnique({
        where: { id: storeId },
        include: { address: true },
      });

      return store;
    }),

  getFirst: adminProcedure.query(async ({ ctx }) => {
    const store = await ctx.db.store.findFirst({
      where: { ownerId: ctx.session.user.id },
    });

    return store;
  }),

  create: adminProcedure
    .input(storeValidator.extend({ logo: z.string() }))
    .mutation(async ({ ctx, input }) => {
      //First, create the slug from the given name
      const slug = input.name.toLowerCase().replace(/ /g, "-");

      //Then, check if the slug is already taken
      const existingStore = await ctx.db.store.findUnique({
        where: { slug },
      });

      if (existingStore) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Store with this name already exists.",
        });
      }

      //Then, create the store
      const store = await ctx.db.store.create({
        data: {
          name: input.name,
          slug,
          ownerId: ctx.session.user.id,
          logo: input.logo,
          address: {
            create: {
              formatted: input.address.formatted,
              street: input.address.street,
              city: input.address.city,
              state: input.address.state,
              postalCode: input.address.postalCode,
              country: input.address.country,
            },
          },
        },
      });

      return {
        data: store,
        message: "Store created successfully.",
      };
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: storeId }) => {
      const store = await ctx.db.store.delete({
        where: { id: storeId },
      });

      return {
        data: store,
        message: "Store deleted successfully.",
      };
    }),

  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.db.store.findMany({});
  }),

  // get: publicProcedure.input(z.string()).query(({ ctx, input: storeId }) => {
  //   return ctx.db.store.findUnique({
  //     where: { id: storeId },
  //     include: {
  //       address: true,
  //       socialMedia: true,
  //     },
  //   });
  // }),

  // getContactInfo: publicProcedure
  //   .input(z.string())
  //   .query(async ({ ctx, input: storeId }) => {
  //     const store = await ctx.db.store.findUnique({
  //       where: { id: storeId },
  //       select: {
  //         contactEmail: true,
  //         contactPhone: true,
  //         address: true,
  //         showFullAddress: true,
  //       },
  //     });

  //     if (store?.showFullAddress) {
  //       return store;
  //     }

  //     return ctx.db.store.findUnique({
  //       where: { id: storeId },
  //       select: {
  //         contactEmail: true,
  //         contactPhone: true,
  //         address: {
  //           select: {
  //             state: true,
  //             city: true,
  //           },
  //         },
  //       },
  //     });
  //   }),

  // create: adminProcedure
  //   .input(z.object({ name: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     const store = await ctx.db.store.create({
  //       data: {
  //         name: input.name,
  //         userId: ctx.session.user.id,
  //       },
  //     });

  //     return {
  //       data: store,
  //       message: "Store created successfully",
  //     };
  //   }),

  update: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        name: z.string(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const store = await ctx.db.store.update({
        where: { id: input.storeId },
        data: {
          name: input.name,
          contactEmail: input.contactEmail,
          publicPhone: input.contactPhone,
          // contactPhone: input.contactPhone,
        },
      });

      return {
        data: store,
        message: "Store updated successfully",
      };
    }),

  // delete: adminProcedure
  //   .input(z.string())
  //   .mutation(async ({ ctx, input: storeId }) => {
  //     const store = await ctx.db.store.delete({
  //       where: { id: storeId },
  //     });

  //     return {
  //       data: store,
  //       message: "Store deleted successfully",
  //     };
  //   }),

  getShipping: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        subTotal: z.coerce.number().nonnegative(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const store = await ctx.db.store.findUnique({
          where: { id: input.storeId },
          select: {
            hasFreeShipping: true,
            minFreeShipping: true,
            hasPickup: true,

            flatRateAmount: true,
            hasFlatRate: true,
          },
        });
        if (!store) return 0;

        // Condition 1: Only free shipping
        if (store.hasFreeShipping) {
          if (input.subTotal >= (store?.minFreeShipping ?? 0) * 100) return 0;
          if (input.subTotal < (store?.minFreeShipping ?? 0) * 100)
            return (store?.flatRateAmount ?? 0) * 100;
        }

        //Condition 2: If they don't qualify for free shipping, they get a flat rate
        if (store.hasFlatRate) {
          return (store?.flatRateAmount ?? 0) * 100;
        }

        return 0;
      } catch (error) {
        return 0;
      }
    }),

  updateBrandingSettings: adminProcedure
    .input(brandingSettingsValidator.extend({ storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const currentStore = await ctx.db.store.findUnique({
        where: { id: input.storeId },
      });

      const storeName = currentStore?.name;
      let slug = currentStore?.slug;

      if (input.businessName !== storeName) {
        //First, create the slug from the given name
        slug = input.businessName.toLowerCase().replace(/ /g, "-");

        //Then, check if the slug is already taken
        const existingStore = await ctx.db.store.findUnique({
          where: { slug },
        });

        if (existingStore) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Store with this name already exists.",
          });
        }
      }

      const store = await ctx.db.store.update({
        where: { id: input.storeId },
        data: {
          name: input.businessName,
          contactEmail: input.businessEmail,
          publicPhone: input.businessPhone,
          logo: input.businessLogo ?? undefined,
          slug,
        },
      });

      return {
        data: store,
        slug,
        message: "Branding settings updated successfully",
      };
    }),

  updateStoreShippingSettings: adminProcedure
    .input(shippingSettingsValidator.extend({ storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const address = await ctx.db.store.findUnique({
        where: { id: input.storeId },
        select: { address: true },
      });

      if (!address) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Store not found",
        });
      }

      const store = await ctx.db.store.update({
        where: { id: input.storeId },
        data: {
          address: {
            upsert: {
              where: { id: address.address?.id },
              update: { ...input.address },
              create: { ...input.address },
            },
          },
          hasFreeShipping: input.hasFreeShipping,
          minFreeShipping: input.minFreeShipping,
          hasPickup: input.hasPickup,

          hasFlatRate: input.hasFlatRate,
          flatRateAmount: input.flatRateAmount,

          showFullAddress: input.showFullAddress,
          pickupInstructions: input?.pickupInstructions,
        },
        include: { address: true },
      });

      return {
        data: store,
        message: "Shipping settings updated successfully",
      };
    }),

  updateHomepageSettings: adminProcedure
    .input(
      homepageSettingsValidator
        .extend({ storeId: z.string() })
        .omit({ tempImages: true, tempCallToActionImage: true }),
    )
    .mutation(async ({ ctx, input }) => {
      const store = await ctx.db.homePageSettings.upsert({
        where: { storeId: input.storeId },
        update: input,
        create: input,
      });

      return {
        data: store,
        message: "Homepage settings updated successfully",
      };
    }),

  getHomepageSettings: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: storeId }) => {
      const store = await ctx.db.homePageSettings.findUnique({
        where: { storeId },
      });

      return store;
    }),
});
