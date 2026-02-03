import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
// SECURITY FIX: Import authentication middleware to protect mutations
import { requireAuth } from "../lib/auth";
// SECURITY FIX: Import validation utilities
import { validateString, validateOptionalString, validateUrl, validateTags, MAX_LENGTHS } from "../lib/validation";

export const getProjects = query({
    args: {},
    handler: async (ctx) => {
        const projects = await ctx.db.query("projects").collect();
        return Promise.all(
            projects.map(async (project) => {
                let imageUrl: string | null = null;
                if (project.storageId) {
                    try {
                        imageUrl = await ctx.storage.getUrl(project.storageId);
                    } catch (e) {
                        console.error("Failed to get storage URL for project:", project._id, e);
                    }
                }

                return {
                    ...project,
                    storageId: imageUrl ?? project.storageId,
                };
            }),
        );
    },
});

export const getProjectById = query({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.id);
        if (!project) return null;
        
        let imageUrl: string | null = null;
        if (project.storageId) {
            try {
                imageUrl = await ctx.storage.getUrl(project.storageId);
            } catch (e) {
                console.error("Failed to get storage URL for project:", project._id, e);
            }
        }
        
        return {
            ...project,
            storageId: imageUrl ?? project.storageId,
        };
    },
});

export const addProject = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        tags: v.array(v.string()),
        storageId: v.string(),
        link: v.optional(v.string()),
        repo: v.optional(v.string()),
        // SECURITY FIX: Require authentication token to create projects
        token: v.string(),
    },
    handler: async (ctx, args) => {
        // SECURITY CHECK: Verify user is authenticated admin before creating project
        await requireAuth(ctx, args.token);

        // SECURITY FIX: Validate and sanitize all inputs
        const validatedTitle = validateString(args.title, "Title", MAX_LENGTHS.TITLE);
        const validatedDescription = validateString(args.description, "Description", MAX_LENGTHS.DESCRIPTION);
        const validatedTags = validateTags(args.tags);
        const validatedLink = validateUrl(args.link, "Project link");
        const validatedRepo = validateUrl(args.repo, "Repository link");
        const validatedStorageId = validateString(args.storageId, "Storage ID", 500);

        return await ctx.db.insert("projects", {
            title: validatedTitle,
            description: validatedDescription,
            tags: validatedTags,
            storageId: validatedStorageId,
            link: validatedLink,
            repo: validatedRepo,
        });
    },
});

export const updateProject = mutation({
    args: {
        id: v.id("projects"),
        title: v.string(),
        description: v.string(),
        tags: v.array(v.string()),
        storageId: v.string(),
        link: v.optional(v.string()),
        repo: v.optional(v.string()),
        // SECURITY FIX: Require authentication token to update projects
        token: v.string(),
    },
    handler: async (ctx, args) => {
        // SECURITY CHECK: Verify user is authenticated admin before updating project
        await requireAuth(ctx, args.token);

        // SECURITY FIX: Validate and sanitize all inputs
        const validatedTitle = validateString(args.title, "Title", MAX_LENGTHS.TITLE);
        const validatedDescription = validateString(args.description, "Description", MAX_LENGTHS.DESCRIPTION);
        const validatedTags = validateTags(args.tags);
        const validatedLink = validateUrl(args.link, "Project link");
        const validatedRepo = validateUrl(args.repo, "Repository link");
        const validatedStorageId = validateString(args.storageId, "Storage ID", 500);

        await ctx.db.patch(args.id, {
            title: validatedTitle,
            description: validatedDescription,
            tags: validatedTags,
            storageId: validatedStorageId,
            link: validatedLink,
            repo: validatedRepo,
        });
    },
});
