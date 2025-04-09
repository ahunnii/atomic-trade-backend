import { attributeRouter } from "~/server/api/routers/attribute";
// import { blogPostRouter } from "~/server/api/routers/blog-post";
// import { collectionsRouter } from "~/server/api/routers/collection";
// import { contentRouter } from "~/server/api/routers/content-page";
// import { invoiceRouter } from "~/server/api/routers/invoice";
// import { ordersRouter } from "~/server/api/routers/order";
// import { productsRouter } from "~/server/api/routers/product";
// import { reviewRouter } from "~/server/api/routers/review";
// import { shippingLabelRouter } from "~/server/api/routers/shipping";
// import { showcaseItemRouter } from "~/server/api/routers/showcase-item";
import { storeRouter } from "~/server/api/routers/store";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

// import { emailServiceRouter } from "~/lib/email/api/email-service-router.trpc";
// import { mediaRouter } from "~/lib/media/api/media-router.trpc";
// import { paymentServiceRouter } from "~/lib/payment/api/payment-router.trpc";

// import { couponRouter } from "./routers/coupon";
// import { requestRouter } from "./routers/custom-request";
// import { customersRouter } from "./routers/customer";
// import { policyRouter } from "./routers/policy";
// import { salesRouter } from "./routers/sale";
// import { shoppingBagRouter } from "./routers/shopping-bag";
// import { timelineRouter } from "./routers/timeline";
import { userRouter } from "./routers/users";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  store: storeRouter,
  // blogPosts: blogPostRouter,

  // collections: collectionsRouter,

  // order: ordersRouter,
  // product: productsRouter,
  users: userRouter,
  // invoices: invoiceRouter,
  attribute: attributeRouter,
  // showcaseItems: showcaseItemRouter,

  // shoppingBag: shoppingBagRouter,

  // shipping: shippingLabelRouter,
  // mediaUpload: mediaRouter,
  // emailService: emailServiceRouter,

  // customRequest: requestRouter,

  // paymentService: paymentServiceRouter,

  // review: reviewRouter,
  // contentPage: contentRouter,

  // customer: customersRouter,
  // sale: salesRouter,
  // coupon: couponRouter,
  // timeline: timelineRouter,
  // policy: policyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
