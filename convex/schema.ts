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
  commissions: defineTable({
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
    cover: v.optional(v.string()),
    deletedAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    status: v.union(v.literal("Backlog"), v.literal("Todo"), v.literal("In progress"), v.literal("Done"),
    v.literal("Cancelled"), v.literal("Duplicate")),
  }),
  stats: defineTable({
    likes: v.number(),
    views: v.number(),
  }),
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  }),
  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  }),
  blogPosts: defineTable({
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    updatedAt: v.optional(v.number()),
    image: v.optional(v.string()),
    deletedAt: v.optional(v.number()),
  }),
  files: defineTable({
    name: v.string(),
    url: v.string(),
    type: v.string(),
    size: v.number(),
  }),
  tags: defineTable({
    name: v.string(),
    color: v.string(),
  }),
});