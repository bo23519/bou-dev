import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    storageId: v.string(), // Image URL
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
    link: v.optional(v.string()),
    repo: v.optional(v.string()),
  }),
  links: defineTable({
    name: v.string(),
    url: v.string(),
    icon: v.string(),
    file: v.boolean(),
  }),
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
  stats: defineTable({
    likes: v.number(),
    views: v.number(),
  }),
  blogPosts: defineTable({
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    publishedAt: v.optional(v.number()),
    image: v.optional(v.string()),
  }),
});