import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCommissions = query({
  args: {},
  handler: async (ctx) => {
    const allCommissions = await ctx.db.query("commissions").collect();
    const commissions = allCommissions.filter(
      (c) => c.deletedAt === undefined || c.deletedAt === null
    );

    return Promise.all(
      commissions.map(async (commission) => {
        let coverUrl: string | null = null;
        if (commission.cover) {
          try {
            coverUrl = await ctx.storage.getUrl(commission.cover);
          } catch (e) {
            console.error("Failed to get storage URL for commission:", commission._id, e);
          }
        }

        return {
          ...commission,
          cover: coverUrl ?? commission.cover ?? null,
        };
      })
    );
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
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("commissions", args);
  },
});

export const updateCommission = mutation({
  args: {
    id: v.id("commissions"),
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
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    await ctx.db.patch(id, updateData);
  },
});

export const deleteCommission = mutation({
  args: { id: v.id("commissions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { deletedAt: Date.now() });
  },
});
