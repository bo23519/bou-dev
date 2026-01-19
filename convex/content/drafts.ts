import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const getDraft = query({
  args: {
    type: v.union(
      v.literal("blog"),
      v.literal("project"),
      v.literal("commission")
    ),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db
      .query("drafts")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .first();
    return draft;
  },
});

export const upsertDraft = mutation({
  args: {
    type: v.union(
      v.literal("blog"),
      v.literal("project"),
      v.literal("commission")
    ),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const existingDraft = await ctx.db
      .query("drafts")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .first();

    if (existingDraft) {
      await ctx.db.patch(existingDraft._id, {
        data: args.data,
        updatedAt: Date.now(),
      });
      return existingDraft._id;
    } else {
      return await ctx.db.insert("drafts", {
        type: args.type,
        data: args.data,
        updatedAt: Date.now(),
      });
    }
  },
});

export const deleteDraft = mutation({
  args: {
    type: v.union(
      v.literal("blog"),
      v.literal("project"),
      v.literal("commission")
    ),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db
      .query("drafts")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .first();

    if (draft) {
      await ctx.db.delete(draft._id);
    }
  },
});