import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run cleanup daily at 3am UTC
crons.daily(
  "cleanup soft-deleted commissions",
  { hourUTC: 3, minuteUTC: 0 },
  internal.cleanup.cleanupCommissions
);

crons.daily(
  "cleanup soft-deleted blog posts",
  { hourUTC: 3, minuteUTC: 5 },
  internal.cleanup.cleanupBlogPosts
);

export default crons;
