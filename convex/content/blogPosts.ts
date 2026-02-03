import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
// SECURITY FIX: Import authentication middleware to protect mutations
import { requireAuth } from "../lib/auth";

export const getBlogPostPaginated = query({
    args: { paginationOpts: paginationOptsValidator },
    handler: async (ctx, args) => {
      const allPosts = await ctx.db
        .query("blogPosts")
        .collect();
      
      const activePosts = allPosts
        .filter((post) => !post.deletedAt)
        .sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0));
      
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
    args: { 
        page: v.number(), 
        itemsPerPage: v.number(),
        filterTags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        try {
            const allPosts = await ctx.db
                .query("blogPosts")
                .collect();
            
            let activePosts = allPosts
                .filter((post) => {
                    const deletedAt = post.deletedAt;
                    return deletedAt === undefined || deletedAt === null || deletedAt === 0;
                })
                .sort((a, b) => {
                    const timeA = a._creationTime ?? 0;
                    const timeB = b._creationTime ?? 0;
                    return timeB - timeA;
                });
            
            if (args.filterTags && args.filterTags.length > 0) {
                activePosts = activePosts.filter((post) =>
                    args.filterTags!.every((filterTag) => post.tags.includes(filterTag))
                );
            }
            
            const startIndex = (args.page - 1) * args.itemsPerPage;
            const endIndex = startIndex + args.itemsPerPage;
            const pagePosts = activePosts.slice(startIndex, endIndex);
            
            const hasNextPage = endIndex < activePosts.length;

            return {
                page: pagePosts.map((post) => {
                    if (!post || !post._id) {
                        return null;
                    }
                    return {
                        Id: post._id,
                        Title: post.title || "",
                        Tags: post.tags || [],
                        PublishedAt: post._creationTime,
                        Image: post.image || undefined,
                    };
                }).filter((post) => post !== null),
                nextCursor: hasNextPage ? "has-more" : null,
                totalFiltered: activePosts.length,
            };
        } catch (error) {
            console.error("Error in getBlogPostByPage:", error);
            throw error;
        }
    },
  });

export const getNumOfPages = query({
    args: { 
        itemsPerPage: v.number(),
        filterTags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const allPosts = await ctx.db.query("blogPosts").collect();
        
        let activePosts = allPosts.filter((post) => !post.deletedAt);
        
        if (args.filterTags && args.filterTags.length > 0) {
            activePosts = activePosts.filter((post) =>
                args.filterTags!.every((filterTag) => post.tags.includes(filterTag))
            );
        }
        
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
    args: {
        title: v.string(),
        content: v.string(),
        tags: v.array(v.string()),
        // SECURITY FIX: Require authentication token to create blog posts
        token: v.string(),
    },
    handler: async (ctx, args) => {
        // SECURITY CHECK: Verify user is authenticated admin before creating post
        await requireAuth(ctx, args.token);

        // Extract token from args before inserting to database
        const { token, ...blogPostData } = args;
        await ctx.db.insert("blogPosts", blogPostData);
    },
});

export const updateBlogPost = mutation({
    args: {
        id: v.id("blogPosts"),
        title: v.string(),
        content: v.string(),
        tags: v.array(v.string()),
        // SECURITY FIX: Require authentication token to update blog posts
        token: v.string(),
    },
    handler: async (ctx, args) => {
        // SECURITY CHECK: Verify user is authenticated admin before updating post
        await requireAuth(ctx, args.token);

        await ctx.db.patch(args.id, { title: args.title, content: args.content, tags: args.tags });
    },
});

export const deleteBlogPost = mutation({
    args: {
        id: v.id("blogPosts"),
        // SECURITY FIX: Require authentication token to delete blog posts
        token: v.string(),
    },
    handler: async (ctx, args) => {
        // SECURITY CHECK: Verify user is authenticated admin before soft-deleting post
        await requireAuth(ctx, args.token);

        await ctx.db.patch(args.id, { deletedAt: Date.now() });
    },
});

export const getLatestBlogPost = query({
    args: {},
    handler: async (ctx) => {
        const allPosts = await ctx.db.query("blogPosts").collect();
        
        const activePosts = allPosts
            .filter((post) => !post.deletedAt)
            .sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0));
        
        if (activePosts.length === 0) return null;
        
        const post = activePosts[0];
        return {
            _id: post._id,
            title: post.title,
            tags: post.tags,
            _creationTime: post._creationTime,
        };
    },
});
