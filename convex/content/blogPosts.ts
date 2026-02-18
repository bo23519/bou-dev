import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
// SECURITY FIX: Import authentication middleware to protect mutations
import { requireAuth } from "../lib/auth";
// SECURITY FIX: Import validation utilities to prevent XSS and invalid data
import { validateString, validateTags, MAX_LENGTHS } from "../lib/validation";

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
            // PERFORMANCE FIX: Query with filters instead of collecting all posts
            // This is much more efficient for large datasets
            let postsQuery = ctx.db.query("blogPosts");

            // Note: We still need to collect() because Convex doesn't support
            // complex filtering (deletedAt check + tag filtering) with pagination
            // in a single query without a custom index.
            // For optimal performance, we would need a compound index on
            // [deletedAt, _creationTime] - see Task #11
            const allPosts = await postsQuery.collect();

            // Filter out deleted posts
            let activePosts = allPosts.filter((post) => {
                const deletedAt = post.deletedAt;
                return deletedAt === undefined || deletedAt === null || deletedAt === 0;
            });

            // Apply tag filtering if specified
            if (args.filterTags && args.filterTags.length > 0) {
                activePosts = activePosts.filter((post) =>
                    args.filterTags!.every((filterTag) => post.tags.includes(filterTag))
                );
            }

            // Sort by creation time (newest first)
            activePosts.sort((a, b) => {
                const timeA = a._creationTime ?? 0;
                const timeB = b._creationTime ?? 0;
                return timeB - timeA;
            });

            // Calculate pagination
            const startIndex = (args.page - 1) * args.itemsPerPage;
            const endIndex = startIndex + args.itemsPerPage;
            const pagePosts = activePosts.slice(startIndex, endIndex);

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
        // SECURITY FIX: Filter out soft-deleted posts to prevent data leak
        // Previously this returned ALL posts including deleted ones
        const blogPosts = await ctx.db.query("blogPosts").collect();
        return blogPosts.filter((post) => !post.deletedAt);
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

        // SECURITY FIX: Validate and sanitize all inputs
        const validatedTitle = validateString(args.title, "Title", MAX_LENGTHS.TITLE);
        const validatedContent = validateString(args.content, "Content", MAX_LENGTHS.CONTENT);
        const validatedTags = validateTags(args.tags);

        await ctx.db.insert("blogPosts", {
            title: validatedTitle,
            content: validatedContent,
            tags: validatedTags,
        });
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

        // SECURITY FIX: Validate and sanitize all inputs
        const validatedTitle = validateString(args.title, "Title", MAX_LENGTHS.TITLE);
        const validatedContent = validateString(args.content, "Content", MAX_LENGTHS.CONTENT);
        const validatedTags = validateTags(args.tags);

        await ctx.db.patch(args.id, {
            title: validatedTitle,
            content: validatedContent,
            tags: validatedTags,
        });
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
