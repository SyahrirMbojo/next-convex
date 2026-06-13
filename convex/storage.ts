import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

export const getStorageUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) =>
    await ctx.storage.getUrl(args.storageId as Id<"_storage">),
});
