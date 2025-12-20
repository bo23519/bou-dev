import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    storageId: v.string(), // Image URL
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
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
  guestbook: defineTable({
    name: v.string(),
    message: v.string(),
    createdAt: v.number(),
  }),
});