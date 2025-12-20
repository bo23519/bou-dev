import { query } from "./_generated/server";

// export const getProjects = query({
//     args: {},
//     handler: async (ctx) => {
//         return await ctx.db.query("projects").collect();
//     },
// });


export const getProjects = query({
    args: {},
    handler: async (ctx) => {
        const projects = await ctx.db.query("projects").collect();
        return Promise.all(
            projects.map(async (project) => {
                // Only try to get URL if storageId exists
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
                    // Replace the storage ID with the actual URL
                    // We use the original storageId as a fallback if the file isn't found
                    storageId: imageUrl ?? project.storageId,
                };
            }),
        );
    },
});
