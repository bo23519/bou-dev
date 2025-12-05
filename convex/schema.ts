import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
