import { mutation, internalMutation } from "../_generated/server";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const cleanupCommissions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - THIRTY_DAYS_MS;
    
    const deletedCommissions = await ctx.db
      .query("commissions")
      .collect();
    
    const toDelete = deletedCommissions.filter(
      (c) => c.deletedAt && c.deletedAt < thirtyDaysAgo
    );
    
    for (const commission of toDelete) {
      if (commission.cover) {
        try {
          await ctx.storage.delete(commission.cover as any);
        } catch (e) {
          // Storage file may not exist or already deleted
        }
      }
      await ctx.db.delete(commission._id);
    }
    
    return { deleted: toDelete.length };
  },
});

export const cleanupBlogPosts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - THIRTY_DAYS_MS;
    
    const deletedPosts = await ctx.db
      .query("blogPosts")
      .collect();
    
    const toDelete = deletedPosts.filter(
      (p) => p.deletedAt && p.deletedAt < thirtyDaysAgo
    );
    
    for (const post of toDelete) {
      await ctx.db.delete(post._id);
    }
    
    return { deleted: toDelete.length };
  },
});

export const runCleanup = mutation({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - THIRTY_DAYS_MS;
    
    const commissions = await ctx.db.query("commissions").collect();
    const commissionsToDelete = commissions.filter(
      (c) => c.deletedAt && c.deletedAt < thirtyDaysAgo
    );
    
    for (const commission of commissionsToDelete) {
      if (commission.cover) {
        try {
          await ctx.storage.delete(commission.cover as any);
        } catch (e) {}
      }
      await ctx.db.delete(commission._id);
    }
    
    const blogPosts = await ctx.db.query("blogPosts").collect();
    const postsToDelete = blogPosts.filter(
      (p) => p.deletedAt && p.deletedAt < thirtyDaysAgo
    );
    
    for (const post of postsToDelete) {
      await ctx.db.delete(post._id);
    }
    
    return {
      commissionsDeleted: commissionsToDelete.length,
      blogPostsDeleted: postsToDelete.length,
    };
  },
});
