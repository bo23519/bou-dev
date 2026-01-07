import { mutation, query } from "../_generated/server";

export const getLikes = query({
    args: {},
    handler: async (ctx) => {
        const stats = await ctx.db.query("stats").first();
        return stats?.likes ?? 0;
    },
});

export const addLike = mutation({
    args: {},
    handler: async (ctx) => {
      const stats = await ctx.db.query("stats").first();
      
      if (stats) {
        await ctx.db.patch(stats._id, { likes: stats.likes + 1 });
        return stats.likes + 1;
      } else {
        await ctx.db.insert("stats", { likes: 1, views: 0 });
        return 1;
      }
    },
});

export const getViews = query({
    args: {},
    handler: async (ctx) => {
        const stats = await ctx.db.query("stats").first();
        return stats?.views ?? 0;
    },
});

export const addView = mutation({
    args: {},
    handler: async (ctx) => {
        const stats = await ctx.db.query("stats").first();
        if (stats) {
            await ctx.db.patch(stats._id, { views: stats.views + 1 });
            return stats.views + 1;
        } else {
            await ctx.db.insert("stats", { likes: 0, views: 1 });
            return 1;
        }
    },
});
