import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    _id: v.id("projects"),
    storageId: v.string(), // Image URL
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
  }),
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
  guestbook: defineTable({
    name: v.string(),
    message: v.string(),
    createdAt: v.number(),
  }),
});