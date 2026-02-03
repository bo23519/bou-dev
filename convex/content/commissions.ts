import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
// SECURITY FIX: Import authentication middleware to protect mutations
import { requireAuth } from "../lib/auth";

export const getCommissions = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("commissions")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .paginate(args.paginationOpts);

    const commissionsWithUrls = await Promise.all(
      results.page.map(async (commission) => {
        let coverUrl: string | null = null;
        if (commission.cover) {
          // If already a URL, use it directly; otherwise resolve from storage
          if (commission.cover.startsWith("http")) {
            coverUrl = commission.cover;
          } else {
            try {
              coverUrl = await ctx.storage.getUrl(commission.cover);
            } catch (e) {
              console.error("Failed to get storage URL for commission:", commission._id, e);
            }
          }
        }

        return {
          ...commission,
          cover: coverUrl ?? commission.cover ?? null,
        };
      })
    );

    return {
      ...results,
      page: commissionsWithUrls,
    };
  },
});

export const getCommissionById = query({
  args: { id: v.id("commissions") },
  handler: async (ctx, args) => {
    const commission = await ctx.db
      .query("commissions")
      .filter((q) => q.eq(q.field("_id"), args.id))
      .first();
    if (commission && commission.deletedAt) {
      return null;
    }
    if (commission && commission.cover) {
      // If already a URL, use it directly
      if (commission.cover.startsWith("http")) {
        return commission;
      }
      try {
        const coverUrl = await ctx.storage.getUrl(commission.cover);
        return {
          ...commission,
          cover: coverUrl,
        };
      } catch (e) {
        console.error("Failed to get storage URL for commission:", commission._id, e);
        return commission;
      }
    }
    return commission;
  },
});

export const addCommission = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
    cover: v.optional(v.string()),
    status: v.union(
      v.literal("Backlog"),
      v.literal("Todo"),
      v.literal("In progress"),
      v.literal("Done"),
      v.literal("Cancelled"),
      v.literal("Duplicate")
    ),
    // SECURITY FIX: Require authentication token to create commissions
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // SECURITY CHECK: Verify user is authenticated admin before creating commission
    await requireAuth(ctx, args.token);

    // Extract token from args before inserting to database
    const { token, ...commissionData } = args;
    await ctx.db.insert("commissions", commissionData);
  },
});

export const updateCommission = mutation({
  args: {
    id: v.id("commissions"),
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
    cover: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
    status: v.union(
      v.literal("Backlog"),
      v.literal("Todo"),
      v.literal("In progress"),
      v.literal("Done"),
      v.literal("Cancelled"),
      v.literal("Duplicate")
    ),
    // SECURITY FIX: Require authentication token to update commissions
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // SECURITY CHECK: Verify user is authenticated admin before updating commission
    await requireAuth(ctx, args.token);

    // Extract id, updatedAt, and token, then patch with remaining data
    const { id, updatedAt, token, ...updateData } = args;
    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
  },
});

export const deleteCommission = mutation({
  args: {
    id: v.id("commissions"),
    // SECURITY FIX: Require authentication token to delete commissions
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // SECURITY CHECK: Verify user is authenticated admin before soft-deleting commission
    await requireAuth(ctx, args.token);

    await ctx.db.patch(args.id, { deletedAt: Date.now() });
  },
});

export const getLatestCommission = query({
  args: {},
  handler: async (ctx) => {
    const commission = await ctx.db
      .query("commissions")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .first();

    if (!commission) return null;

    let coverUrl: string | null = null;
    if (commission.cover) {
      // If already a URL, use it directly; otherwise resolve from storage
      if (commission.cover.startsWith("http")) {
        coverUrl = commission.cover;
      } else {
        try {
          coverUrl = await ctx.storage.getUrl(commission.cover);
        } catch (e) {
          console.error("Failed to get storage URL for commission:", commission._id, e);
        }
      }
    }

    return {
      ...commission,
      cover: coverUrl ?? commission.cover ?? null,
    };
  },
});