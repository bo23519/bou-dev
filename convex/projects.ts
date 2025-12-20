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
                // Get the public URL for the storage ID
                const imageUrl = await ctx.storage.getUrl(project.storageId);
                console.log(imageUrl);

                return {
                    ...project,
                    // Replace the storage ID with the actual URL
                    // We use the ID as a fallback if the file isn't found
                    storageId: imageUrl ?? project.storageId,
                };
            }),
        );
    },
});
