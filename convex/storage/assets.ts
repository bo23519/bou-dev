import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../lib/auth";

export const getAssets = query({
  args: {},
  handler: async (ctx) => {
    const assets = await ctx.db.query("assets").collect();
    const assetsWithUrls = await Promise.all(
      assets.map(async (asset) => {
        let imageUrl: string | null = null;
        if (asset.storageId) {
          try {
            imageUrl = await ctx.storage.getUrl(asset.storageId);
          } catch (e) {
            console.error("Failed to get storage URL for asset:", asset._id, e);
          }
        }

        return {
          ...asset,
          url: imageUrl ?? asset.url ?? null,
        };
      }),
    );

    return assetsWithUrls.reduce((acc, asset) => {
      acc[asset.key] = asset;
      return acc;
    }, {} as Record<string, typeof assetsWithUrls[number]>);
  },
});

export const getAsset = query({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const asset = await ctx.db
      .query("assets")
      .filter((q) => q.eq(q.field("key"), args.key))
      .first();

    if (!asset) return null;

    let imageUrl: string | null = null;
    if (asset.storageId) {
      try {
        imageUrl = await ctx.storage.getUrl(asset.storageId);
      } catch (e) {
        console.error("Failed to get storage URL for asset:", asset._id, e);
      }
    }

    return {
      ...asset,
      url: imageUrl ?? asset.url ?? null,
    };
  },
});

export const setAsset = mutation({
  args: {
    key: v.string(),
    storageId: v.optional(v.string()),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx, args.token);
    const existing = await ctx.db
      .query("assets")
      .filter((q) => q.eq(q.field("key"), args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        storageId: args.storageId ?? existing.storageId,
        url: args.url ?? existing.url,
        description: args.description ?? existing.description,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("assets", {
        key: args.key,
        storageId: args.storageId,
        url: args.url,
        description: args.description,
      });
    }
  },
});
