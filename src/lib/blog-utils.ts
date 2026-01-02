/**
 * Shared utilities for blog pages
 */

/**
 * Format timestamp to human-readable EDT date
 */
export const formatBlogDate = (timestamp: number | undefined): string => {
  if (!timestamp) return "No date";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Blog pagination constants
 */
export const BLOG_CONSTANTS = {
  ITEMS_PER_PAGE: 10,
} as const;
