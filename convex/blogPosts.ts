import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const list = query({
    args: { paginationOpts: paginationOptsValidator },
    handler: async (ctx, args) => {
      const result = await ctx.db
        .query("blogPosts")
        .order("desc")
        .paginate(args.paginationOpts);
      return result;
    },
  });

export const getAllBlogPosts = query({
    args: {},
    handler: async (ctx) => {
        const blogPosts = await ctx.db.query("blogPosts").collect();
        return blogPosts;
    },
});

export const addBlogPost = mutation({
    args: { title: v.string(),
        content: v.string(),
        tags: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("blogPosts", args);
    },
});

export const updateBlogPost = mutation({
    args: { id: v.id("blogPosts"), title: v.string(), content: v.string(), tags: v.array(v.string()) },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { title: args.title, content: args.content, tags: args.tags });
    },
});

export const deleteBlogPost = mutation({
    args: { id: v.id("blogPosts") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});