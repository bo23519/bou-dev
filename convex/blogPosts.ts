import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const getBlogPostPaginated = query({
    args: { paginationOpts: paginationOptsValidator },
    handler: async (ctx, args) => {
      // Note: pagination doesn't support filtering, so we collect and filter manually
      const allPosts = await ctx.db
        .query("blogPosts")
        .order("desc")
        .collect();
      
      const activePosts = allPosts.filter((post) => !post.deletedAt);
      
      // Manual pagination
      const startIndex = 0;
      const endIndex = Math.min(args.paginationOpts.numItems, activePosts.length);
      const pagePosts = activePosts.slice(startIndex, endIndex);

        return {
            page: pagePosts.map((_id) => ({
                Title: _id.title,
                Tags: _id.tags,
                PublishedAt: _id._creationTime,
                Image: _id.image,
                })),
            nextCursor: endIndex < activePosts.length ? "has-more" : null,
        };
    },
  });

export const getBlogPostByPage = query({
    args: { page: v.number(), itemsPerPage: v.number() },
    handler: async (ctx, args) => {
        // Fetch all posts once (single query), then filter out deleted posts
        const allPosts = await ctx.db
            .query("blogPosts")
            .order("desc")
            .collect();
        
        // Filter out deleted posts (where deletedAt is not set/undefined)
        const activePosts = allPosts.filter((post) => !post.deletedAt);
        
        // Calculate pagination
        const startIndex = (args.page - 1) * args.itemsPerPage;
        const endIndex = startIndex + args.itemsPerPage;
        const pagePosts = activePosts.slice(startIndex, endIndex);
        
        // Check if there's a next page
        const hasNextPage = endIndex < activePosts.length;

        return {
            page: pagePosts.map((post) => ({
                Id: post._id,
                Title: post.title,
                Tags: post.tags,
                PublishedAt: post._creationTime,
                Image: post.image,
            })),
            nextCursor: hasNextPage ? "has-more" : null,
        };
    },
});

export const getNumOfPages = query({
    args: { itemsPerPage: v.number() },
    handler: async (ctx, args) => {
        const allPosts = await ctx.db.query("blogPosts").collect();
        // Filter out deleted posts
        const activePosts = allPosts.filter((post) => !post.deletedAt);
        const totalCount = activePosts.length;
        const numOfPages = Math.ceil(totalCount / args.itemsPerPage);
        return numOfPages;
    },
});

export const getAllBlogPosts = query({
    args: {},
    handler: async (ctx) => {
        const blogPosts = await ctx.db.query("blogPosts").collect();
        return blogPosts;
    },
});

export const getBlogPostById = query({
    args: { id: v.id("blogPosts") },
    handler: async (ctx, args) => {
        const blogPost = await ctx.db
            .query("blogPosts")
            .filter((q) => q.eq(q.field("_id"), args.id))
            .first();
        // Return null if post is deleted
        if (blogPost && blogPost.deletedAt) {
            return null;
        }
        return blogPost;
    },
});

export const getBlogPostByTitle = query({
    args: { title: v.string() },
    handler: async (ctx, args) => {
        const blogPost = await ctx.db.query("blogPosts").filter((q) => q.eq(q.field("title"), args.title)).first();
        return blogPost;
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
        // Soft delete: set deletedAt timestamp instead of deleting
        await ctx.db.patch(args.id, { deletedAt: Date.now() });
    },
});