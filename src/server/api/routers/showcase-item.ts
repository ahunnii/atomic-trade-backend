import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

import { hygraphClient, hygraphClientPublic } from "~/lib/cms/clients/hygraph";

import { showcaseItemValidator } from "~/lib/validators/showcase";
import {
  type CreateShowcaseItemResponse,
  type ShowcaseItem,
  type ShowcaseItemResponse,
  type ShowcaseItemsResponse,
} from "~/types/content";

import {
  createShowcaseItem,
  deleteShowcaseItem,
  getShowcaseItem,
  getShowcaseItemBySlug,
  getShowcaseItems,
  publishShowcaseItem,
  updateShowcaseItem,
} from "../../../lib/cms/graphql/showcase";

export const showcaseItemRouter = createTRPCRouter({
  getBySlug: publicProcedure
    .input(z.string())
    .query(async ({ input: slug }) => {
      const cmsResponse = await hygraphClientPublic.request(
        getShowcaseItemBySlug,
        { slug: slug }
      );

      const showcaseItem = {
        ...(cmsResponse as ShowcaseItemResponse).showcaseItem,
      };

      return showcaseItem as ShowcaseItem;
    }),

  get: publicProcedure
    .input(z.string())
    .query(async ({ input: showcaseItemId }) => {
      const cmsResponse = await hygraphClientPublic.request(getShowcaseItem, {
        id: showcaseItemId,
      });

      const showcaseItem = {
        ...(cmsResponse as ShowcaseItemResponse).showcaseItem,
      };

      console.log(showcaseItem);
      return showcaseItem as ShowcaseItem;
    }),

  getAll: publicProcedure.query(async () => {
    const cmsResponse = await hygraphClient.request(getShowcaseItems);
    const showcaseItems = (cmsResponse as ShowcaseItemsResponse).showcaseItems;
    return showcaseItems.map((showcaseItem) => ({
      ...showcaseItem,
    })) as ShowcaseItem[];
  }),

  create: adminProcedure
    .input(showcaseItemValidator)
    .mutation(async ({ input }) => {
      const cmsResponse = await hygraphClient.request(createShowcaseItem, {
        image: input.image,
        title: input.title,
        description: input.description,
        alt: input.alt,
      });

      await hygraphClient.request(publishShowcaseItem, {
        id: (cmsResponse as CreateShowcaseItemResponse)?.createShowcaseItem?.id,
      });
      return cmsResponse as ShowcaseItem;
    }),

  createMany: adminProcedure
    .input(z.array(showcaseItemValidator))
    .mutation(async ({ input }) => {
      const mapLargeResponse = await Promise.all(
        input.map(async (item) => {
          // Wait a second before creating the next item
          await new Promise((resolve) => setTimeout(resolve, 250));

          const cmsResponse = await hygraphClient.request(createShowcaseItem, {
            image: item.image,
            title: item.title,
            description: item.description,
            alt: item.alt,
          });
          await new Promise((resolve) => setTimeout(resolve, 250));
          await hygraphClient.request(publishShowcaseItem, {
            id: (cmsResponse as CreateShowcaseItemResponse)?.createShowcaseItem
              ?.id,
          });

          return cmsResponse;
        })
      );

      return mapLargeResponse as ShowcaseItem[];
    }),
  update: adminProcedure
    .input(showcaseItemValidator.extend({ showcaseItemId: z.string() }))
    .mutation(async ({ input }) => {
      const cmsResponse = await hygraphClient.request(updateShowcaseItem, {
        id: input.showcaseItemId,
        title: input.title,
        description: input.description,
        alt: input.alt,
        image: input.image,
      });

      return cmsResponse as ShowcaseItem;
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ input: showcaseItemId }) => {
      const cmsResponse = await hygraphClient.request(deleteShowcaseItem, {
        id: showcaseItemId,
      });

      return cmsResponse as ShowcaseItem;
    }),
});
