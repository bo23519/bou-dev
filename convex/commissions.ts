import { query } from "./_generated/server";

export const getCommissions = query({
  args: {},
  handler: async (ctx) => {
    const allCommissions = await ctx.db.query("commissions").collect();
    const commissions = allCommissions.filter(
      (c) => c.deletedAt === undefined || c.deletedAt === null
    );

    return Promise.all(
      commissions.map(async (commission) => {
        let coverUrl: string | null = null;
        if (commission.cover) {
          try {
            coverUrl = await ctx.storage.getUrl(commission.cover);
          } catch (e) {
            console.error("Failed to get storage URL for commission:", commission._id, e);
          }
        }

        return {
          ...commission,
          cover: coverUrl ?? commission.cover ?? null,
        };
      })
    );
  },
});
