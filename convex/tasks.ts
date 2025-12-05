import { query } from "./_generated/server";

// Dummy query to test Convex connection
export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});
