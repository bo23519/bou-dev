import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const getBlogPostPaginated = query({
    args: { paginationOpts: paginationOptsValidator },
    handler: async (ctx, args) => {
      const result = await ctx.db
        .query("blogPosts")
        .order("desc")
        .paginate(args.paginationOpts);

        return {
            page: result.page.map((_id) => ({
                Title: _id.title,
                Tags: _id.tags,
                PublishedAt: _id._creationTime,
                Image: _id.image,
                })),
            nextCursor: result.continueCursor ?? null,
        };
    },
  });

export const getBlogPostByPage = query({
    args: { page: v.number(), itemsPerPage: v.number() },
    handler: async (ctx, args) => {
        // Fetch all posts once (single query)
        const allPosts = await ctx.db
            .query("blogPosts")
            .order("desc")
            .collect();
        
        // Calculate pagination
        const startIndex = (args.page - 1) * args.itemsPerPage;
        const endIndex = startIndex + args.itemsPerPage;
        const pagePosts = allPosts.slice(startIndex, endIndex);
        
        // Check if there's a next page
        const hasNextPage = endIndex < allPosts.length;

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
        const totalCount = allPosts.length;
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
        const blogPost = await ctx.db.query("blogPosts").filter((q) => q.eq(q.field("_id"), args.id)).first();
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
        await ctx.db.delete(args.id);
    },
});