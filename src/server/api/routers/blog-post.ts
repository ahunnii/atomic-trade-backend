import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

import { hygraphClient, hygraphClientPublic } from "~/lib/cms/clients/hygraph";

import { type ClientError } from "graphql-request";
import {
  type BlogPost,
  type BlogPostResponse,
  type BlogPostsResponse,
} from "~/types/content";

import { blogPostValidator } from "~/lib/validators/blog-post";

import {
  createBlogPost,
  deleteBlogPost,
  getBlogPost,
  getBlogPostBySlug,
  getBlogPosts,
  updateBlogPost,
} from "../../../lib/cms/graphql/blog-posts";

export const blogPostRouter = createTRPCRouter({
  getBySlug: publicProcedure
    .input(z.string())
    .query(async ({ input: slug }) => {
      const cmsResponse = await hygraphClientPublic.request(getBlogPostBySlug, {
        slug,
      });

      const blogPost = {
        ...(cmsResponse as BlogPostResponse).blogPost,
      };

      return blogPost as BlogPost;
    }),

  get: publicProcedure
    .input(z.string())
    .query(async ({ input: blogPostId }) => {
      const cmsResponse = await hygraphClientPublic.request(getBlogPost, {
        id: blogPostId,
      });

      const blogPost = {
        ...(cmsResponse as BlogPostResponse).blogPost,
      };

      return blogPost as BlogPost;
    }),

  getAll: publicProcedure
    .input(z.object({ published: z.boolean() }).optional())
    .query(async ({ input }) => {
      const cmsResponse = await hygraphClient.request(getBlogPosts);

      const blogPosts = (cmsResponse as BlogPostsResponse).blogPosts;

      if (input) {
        return blogPosts
          .map((blogPost) => ({
            ...blogPost,
          }))
          .filter((post) => post.published === input.published) as BlogPost[];
      }

      return blogPosts.map((blogPost) => ({
        ...blogPost,
      })) as BlogPost[];
    }),

  create: adminProcedure
    .input(blogPostValidator.extend({ storeId: z.string() }))
    .mutation(async ({ input }) => {
      const slug = input.slug
        ? input.slug.toLowerCase().replace(/ /g, "-")
        : input.title.toLowerCase().replace(/ /g, "-");

      const tags = input.tags.map((tag) => tag.name);
      try {
        const cmsResponse = await hygraphClient.request(createBlogPost, {
          content: input.content,
          slug,
          title: input.title,
          tags,
          cover: input.cover,
          published: input.published,
        });

        return cmsResponse as BlogPost;
      } catch (error: unknown) {
        const errorMessage =
          (error as ClientError)?.response?.errors?.[0]?.message ?? "";

        if (errorMessage.includes("not unique")) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This slug is already taken. ",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while creating the blog post.",
        });
      }
    }),

  update: adminProcedure
    .input(blogPostValidator.extend({ blogPostId: z.string() }))
    .mutation(async ({ input }) => {
      const tags = input.tags.map((tag) => tag.name);

      try {
        const cmsResponse = await hygraphClient.request(updateBlogPost, {
          content: input.content,
          slug: input.slug,
          id: input.blogPostId,
          title: input.title,
          tags,
          cover: input.cover,
          published: input.published,
        });

        return cmsResponse as BlogPost;
      } catch (error: unknown) {
        const errorMessage =
          (error as ClientError)?.response?.errors?.[0]?.message ?? "";

        if (errorMessage.includes("not unique")) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This slug is already taken. ",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while creating the blog post.",
        });
      }
    }),

  duplicate: adminProcedure
    .input(z.string())
    .mutation(async ({ input: blogPostId }) => {
      const cmsResponse = await hygraphClientPublic.request(getBlogPost, {
        id: blogPostId,
      });

      if (!cmsResponse) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog post not found.",
        });
      }

      const blogPost = {
        ...(cmsResponse as BlogPostResponse).blogPost,
      };

      const slug = blogPost.slug
        ? blogPost.slug.toLowerCase().replace(/ /g, "-")
        : blogPost.title.toLowerCase().replace(/ /g, "-");

      const tags = blogPost.tags.map((tag) => tag);

      try {
        const cmsResponse = await hygraphClient.request(createBlogPost, {
          content: blogPost.content,
          slug: `${slug}-copy`,
          title: `${blogPost.title} (Copy)`,
          tags,
          cover: blogPost.cover,
          published: false,
        });

        return (cmsResponse as { createBlogPost: BlogPost }).createBlogPost;
      } catch (error: unknown) {
        const errorMessage =
          (error as ClientError)?.response?.errors?.[0]?.message ?? "";

        if (errorMessage.includes("not unique")) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This slug is already taken. ",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while creating the blog post.",
        });
      }
    }),

  delete: adminProcedure.input(z.string()).mutation(async ({ input }) => {
    const cmsResponse = await hygraphClient.request(deleteBlogPost, {
      id: input,
    });

    return cmsResponse as BlogPost;
  }),
});
