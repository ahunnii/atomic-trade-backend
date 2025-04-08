import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { hygraphClient, hygraphClientPublic } from "~/lib/cms/clients/hygraph";
import { contentPageValidator } from "~/lib/validators/content-page";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { type BasicGraphQLPage, type BasicGraphQLPages } from "~/types/content";

import {
  createSinglePage,
  deleteSinglePage,
  getPage,
  getPages,
  updatePage as updateSinglePage,
} from "../../../lib/cms/graphql/pages";

const BLACKLISTED_SLUGS = [
  "privacy-policy",
  "refund-policy",
  "shipping-policy",
  "terms-of-service",
  "contact-policy",
];

export const contentRouter = createTRPCRouter({
  get: publicProcedure.input(z.string()).query(async ({ input: slug }) => {
    if (!BLACKLISTED_SLUGS.includes(slug)) {
      const cmsResponse = await hygraphClientPublic.request(getPage, {
        slug,
      });

      return cmsResponse as BasicGraphQLPage;
    }
    return null;
  }),

  getAll: publicProcedure.query(async () => {
    const cmsResponse = await hygraphClientPublic.request(getPages);

    const pages = (cmsResponse as BasicGraphQLPages).pages.filter(
      (page) => !BLACKLISTED_SLUGS.includes(page.slug)
    );

    return pages;
  }),

  update: adminProcedure
    .input(contentPageValidator)
    .mutation(async ({ input }) => {
      const cmsResponse = await hygraphClient.request(updateSinglePage, {
        content: input.content,
        slug: input.slug,
        title: input.title,
      });

      return cmsResponse as BasicGraphQLPage;
    }),

  create: adminProcedure
    .input(contentPageValidator)
    .mutation(async ({ input }) => {
      const cmsResponse = await hygraphClient.request(createSinglePage, {
        content: input.content,
        slug: input.slug,
        title: input.title,
      });

      return cmsResponse as BasicGraphQLPage;
    }),

  duplicate: protectedProcedure
    .input(z.string())
    .mutation(async ({ input: slug }) => {
      if (!BLACKLISTED_SLUGS.includes(slug)) {
        const cmsResponse = await hygraphClientPublic.request(getPage, {
          slug,
        });

        if (!cmsResponse) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Page not found.",
          });
        }

        const cmsCreateResponse = await hygraphClient.request(
          createSinglePage,
          {
            content: (cmsResponse as BasicGraphQLPage).page.content,
            slug: `${(cmsResponse as BasicGraphQLPage).page.slug}-copy`,
            title: `${(cmsResponse as BasicGraphQLPage).page.title} (Copy)`,
          }
        );

        return cmsCreateResponse as BasicGraphQLPage;
      }
      return null;
    }),

  delete: adminProcedure.input(z.string()).mutation(async ({ input: slug }) => {
    const cmsResponse = await hygraphClient.request(deleteSinglePage, {
      slug,
    });

    return cmsResponse as BasicGraphQLPage;
  }),
});
