import { query } from "./_generated/server";

export const getLinks = query({
    args: {},
    handler: async (ctx) => {
        const links = await ctx.db.query("links").collect();
        const linksWithUrls = await Promise.all(
            links.map(async (link) => {
                // Only try to get URL if storageId exists
                let fileUrl: string | null = null;
                if (link.file) {
                    try {
                        fileUrl = await ctx.storage.getUrl(link.url);
                    } catch (e) {
                        console.error("Failed to get file URL for link:", link._id, e);
                    }
                }

                return {
                    ...link,
                    // Replace the file URL with the actual URL if it's a file link
                    ...(link.file && { url: fileUrl ?? link.url }),
                };
            }),
        );

        // Convert array to object keyed by link name
        return linksWithUrls.reduce((acc, link) => {
            acc[link.name] = link;
            return acc;
        }, {} as Record<string, typeof linksWithUrls[number]>);
    },
});
