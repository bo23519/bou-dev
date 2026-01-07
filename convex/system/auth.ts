import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const login = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.username))
      .first();

    if (!user || user.password !== args.password) {
      throw new Error("Invalid credentials");
    }

    const credentials = `${args.username}:${args.password}`;
    const token = btoa(credentials);

    const existingSession = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    if (existingSession) {
      await ctx.db.patch(existingSession._id, {
        token,
        expiresAt,
      });
      return { token, userId: user._id };
    }

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt,
    });

    return { token, userId: user._id };
  },
});

export const verifyToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("token"), args.token))
      .first();

    if (!session) {
      return { valid: false };
    }

    if (session.expiresAt < Date.now()) {
      await ctx.db.delete(session._id);
      return { valid: false };
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      return { valid: false };
    }

    return { valid: true, userId: user._id, username: user.name, role: user.role };
  },
});

export const logout = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("token"), args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existingUser) {
      throw new Error("User already exists");
    }

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: args.password,
      role: args.role || "user",
    });

    return { userId };
  },
});
