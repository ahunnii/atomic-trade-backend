import { z } from "zod";

import {
  CONTACT_POLICY_HTML,
  PRIVACY_POLICY_HTML,
  REFUND_POLICY_HTML,
  TERMS_OF_SERVICE_HTML,
} from "~/data/policy-template-data";
import { hygraphClient, hygraphClientPublic } from "~/lib/cms/clients/hygraph";

import { policiesValidator } from "~/lib/validators/policy";
import {
  adminProcedure,
  createTRPCRouter,
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

type Page = {
  content: string;
  id: string;
  updatedAt: string;
  slug: string;
  title: string;
};
export type PolicyResponse = {
  "privacy-policy": Page;
  "refund-policy": Page;
  "shipping-policy": Page;
  "terms-of-service": Page;
  "contact-policy": Page;
};
const POLICIES = [
  {
    content: PRIVACY_POLICY_HTML,
    slug: "privacy-policy",
    title: "Privacy Policy",
  },
  {
    content: REFUND_POLICY_HTML,
    slug: "refund-policy",
    title: "Refund Policy",
  },
  {
    content: "",
    slug: "shipping-policy",
    title: "Shipping Policy",
  },
  {
    content: TERMS_OF_SERVICE_HTML,
    slug: "terms-of-service",
    title: "Terms of Service",
  },
  {
    content: CONTACT_POLICY_HTML,
    slug: "contact-policy",
    title: "Contact Policy",
  },
];
export const policyRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      if (BLACKLISTED_SLUGS.includes(input.slug)) {
        const cmsResponse = await hygraphClientPublic.request(getPage, {
          slug: input.slug,
        });

        return cmsResponse as BasicGraphQLPage;
      }

      return null;
    }),

  getAll: publicProcedure.query(async () => {
    const cmsResponse = await hygraphClientPublic.request(getPages);

    const mergePagesIntoObject = (cmsResponse as BasicGraphQLPages).pages
      .filter((page) => BLACKLISTED_SLUGS.includes(page.slug))
      .reduce((acc, page) => {
        acc[page.slug] = page;
        return acc;
      }, {} as Record<string, Page>);

    return mergePagesIntoObject;
  }),

  create: adminProcedure
    .input(z.object({ isUsingTemplates: z.boolean() }))
    .mutation(async ({ input }) => {
      const cmsResponse = await Promise.all(
        POLICIES.map(async (page) => {
          // wait a second
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return await hygraphClient.request(createSinglePage, {
            content: input.isUsingTemplates ? page.content : "",
            slug: page.slug,
            title: page.title,
          });
        })
      );

      return cmsResponse as BasicGraphQLPage[];
    }),

  update: adminProcedure
    .input(policiesValidator)
    .mutation(async ({ input }) => {
      const cmsResponse = await Promise.all(
        POLICIES.map(async (page) => {
          return await hygraphClient.request(updateSinglePage, {
            content: input[page.slug as keyof typeof input].content,
            slug: input[page.slug as keyof typeof input].slug,
            title: input[page.slug as keyof typeof input].title,
          });
        })
      );

      return cmsResponse as BasicGraphQLPage[];
    }),

  delete: adminProcedure.mutation(async ({}) => {
    const cmsResponse = await Promise.all(
      POLICIES.map(async (page) => {
        return await hygraphClient.request(deleteSinglePage, {
          slug: page.slug,
        });
      })
    );

    return cmsResponse as BasicGraphQLPage[];
  }),
});
