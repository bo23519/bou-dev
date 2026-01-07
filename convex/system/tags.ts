import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const COLOR_SCHEMES = [
  { name: "Red", color: "#C34128" },
  { name: "Cyan", color: "#59E7D5" },
  { name: "Pink", color: "#FDB9B7" },
  { name: "Gold", color: "#DDA83D" },
  { name: "Lavender", color: "#BFB2E5" },
  { name: "Teal", color: "#3DAD93" },
  { name: "Sky Blue", color: "#A5D5E2" },
  { name: "Orange", color: "#EE6E41" },
  { name: "Rose", color: "#EA6780" },
  { name: "Lime", color: "#B4C966" },
] as const;

export const getColorSchemes = query({
  args: {},
  handler: async () => {
    return COLOR_SCHEMES;
  },
});

export const getTagById = query({
  args: { id: v.id("tags") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getTagByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tags")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

export const getAllTags = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tags").collect();
  },
});

export const createTag = mutation({
  args: {
    name: v.string(),
    colorScheme: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("tags")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      throw new Error(`Tag with name "${args.name}" already exists`);
    }

    const colorScheme = COLOR_SCHEMES.find((scheme) => scheme.name === args.colorScheme);
    if (!colorScheme) {
      throw new Error(`Invalid color scheme: ${args.colorScheme}`);
    }

    return await ctx.db.insert("tags", {
      name: args.name,
      color: colorScheme.color,
    });
  },
});

export const deleteTag = mutation({
  args: { id: v.id("tags") },
  handler: async (ctx, args) => {
    const tag = await ctx.db.get(args.id);
    if (!tag) {
      throw new Error("Tag not found");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
