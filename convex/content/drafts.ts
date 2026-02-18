import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../lib/auth";

const draftType = v.union(
  v.literal("blog"),
  v.literal("project"),
  v.literal("commission")
);

export const getDraft = query({
  args: {
    type: draftType,
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate token manually in query (requireAuth only works in mutations)
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) return null;

    const draft = await ctx.db
      .query("drafts")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .first();
    return draft;
  },
});

export const upsertDraft = mutation({
  args: {
    type: draftType,
    data: v.any(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx, args.token);

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
    type: draftType,
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx, args.token);

    const draft = await ctx.db
      .query("drafts")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .first();

    if (draft) {
      await ctx.db.delete(draft._id);
    }
  },
});