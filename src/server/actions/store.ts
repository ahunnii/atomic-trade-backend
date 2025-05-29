"use server";

import { TRPCError } from "@trpc/server";

import { db } from "../db";

export const getStoreIdViaTRPC = async (storeSlug: string) => {
  const store = await db.store.findUnique({
    where: { slug: storeSlug },
    select: { id: true },
  });

  if (!store) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Store not found" });
  }

  return store.id;
};
