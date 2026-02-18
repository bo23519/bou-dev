import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../lib/auth";

export const generateUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAuth(ctx, args.token);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getImageUrlById = query({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    let imageUrl: string | null = null;
    if (args.storageId) {
      try {
        imageUrl = await ctx.storage.getUrl(args.storageId);
      } catch (e) {
        console.error("Failed to get storage URL for storageId:", args.storageId, e);
      }
  }
    return imageUrl;
  },
});

export const saveFileRecord = mutation({
  args: {
    storageId: v.string(),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx, args.token);
    const fileId = await ctx.db.insert("files", {
      url: args.storageId,
      name: args.name,
      type: args.type,
      size: args.size,
    });
    return fileId;
  },
});
