import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
// SECURITY FIX: Import authentication middleware to protect mutations
import { requireAuth } from "../lib/auth";

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

        // Extract token from args before inserting to database
        const { token, ...projectData } = args;
        return await ctx.db.insert("projects", projectData);
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

        // Extract token and id, then patch with remaining data
        const { id, token, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});
