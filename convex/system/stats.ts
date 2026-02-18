import { mutation, query } from "../_generated/server";

const RATE_WINDOW_MS = 60_000; // 1 minute sliding window
const MAX_LIKES_PER_WINDOW = 60;
const MAX_VIEWS_PER_WINDOW = 120;

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
      const now = Date.now();
      const stats = await ctx.db.query("stats").first();

      if (stats) {
        const isNewWindow = now - (stats.likeWindowStart ?? 0) > RATE_WINDOW_MS;
        const countInWindow = isNewWindow ? 0 : (stats.likesInWindow ?? 0);

        if (countInWindow >= MAX_LIKES_PER_WINDOW) {
          throw new Error("Rate limit exceeded. Please slow down.");
        }

        await ctx.db.patch(stats._id, {
          likes: stats.likes + 1,
          likeWindowStart: isNewWindow ? now : stats.likeWindowStart,
          likesInWindow: countInWindow + 1,
        });
        return stats.likes + 1;
      } else {
        await ctx.db.insert("stats", {
          likes: 1,
          views: 0,
          likeWindowStart: now,
          likesInWindow: 1,
        });
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
        const now = Date.now();
        const stats = await ctx.db.query("stats").first();

        if (stats) {
            const isNewWindow = now - (stats.viewWindowStart ?? 0) > RATE_WINDOW_MS;
            const countInWindow = isNewWindow ? 0 : (stats.viewsInWindow ?? 0);

            if (countInWindow >= MAX_VIEWS_PER_WINDOW) {
              throw new Error("Rate limit exceeded. Please slow down.");
            }

            await ctx.db.patch(stats._id, {
              views: stats.views + 1,
              viewWindowStart: isNewWindow ? now : stats.viewWindowStart,
              viewsInWindow: countInWindow + 1,
            });
            return stats.views + 1;
        } else {
            await ctx.db.insert("stats", {
              likes: 0,
              views: 1,
              viewWindowStart: now,
              viewsInWindow: 1,
            });
            return 1;
        }
    },
});
