import { TRPCError } from "@trpc/server";

import { z } from "zod";
import { storeValidator } from "~/lib/validators/store";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

export const storeRouter = createTRPCRouter({
  get: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input: storeId }) => {
      const store = await ctx.db.store.findUnique({
        where: { id: storeId },
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
});
