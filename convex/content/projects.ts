import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

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
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("projects", {
            title: args.title,
            description: args.description,
            tags: args.tags,
            storageId: args.storageId,
            link: args.link,
            repo: args.repo,
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
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});
