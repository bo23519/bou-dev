import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // CONTENT - Main content tables
  // ============================================
  projects: defineTable({
    storageId: v.string(),
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
    link: v.optional(v.string()),
    repo: v.optional(v.string()),
  }),

  commissions: defineTable({
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
    cover: v.optional(v.string()),
    status: v.union(
      v.literal("Backlog"),
      v.literal("Todo"),
      v.literal("In progress"),
      v.literal("Done"),
      v.literal("Cancelled"),
      v.literal("Duplicate")
    ),
    deletedAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }),

  blogPosts: defineTable({
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    image: v.optional(v.string()),
    deletedAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }),

  // ============================================
  // STORAGE - File and asset management
  // ============================================
  files: defineTable({
    name: v.string(),
    url: v.string(),
    type: v.string(),
    size: v.number(),
  }),

  assets: defineTable({
    key: v.string(),
    storageId: v.optional(v.string()),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
  }).index("by_key", ["key"]),

  // ============================================
  // SYSTEM - Auth, stats, and utilities
  // ============================================
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

  stats: defineTable({
    likes: v.number(),
    views: v.number(),
  }),

  tags: defineTable({
    name: v.string(),
    color: v.string(),
  }).index("by_name", ["name"]),

  links: defineTable({
    name: v.string(),
    url: v.string(),
    icon: v.string(),
    file: v.boolean(),
  }),

  // ============================================
  // DRAFTS - Auto-saved draft content
  // ============================================
  drafts: defineTable({
    type: v.union(
      v.literal("blog"),
      v.literal("project"),
      v.literal("commission")
    ),
    data: v.any(),
    updatedAt: v.number(),
  }).index("by_type", ["type"]),
});
