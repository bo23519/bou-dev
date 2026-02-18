import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
// SECURITY FIX: Import bcryptjs for password hashing
import bcrypt from "bcryptjs";
// SECURITY FIX: Import validation utilities
import { validateString, validateEmail, validatePassword, MAX_LENGTHS } from "../lib/validation";

// Dummy bcrypt hash used when a username does not exist.
// Ensures compareSync always runs regardless of whether the user was found,
// eliminating the timing difference that would reveal valid usernames.
const DUMMY_HASH = "$2b$10$invalidhashfortimingXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

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

    // Always run bcrypt compare — even when the user doesn't exist — so that a
    // missing username and a wrong password take the same amount of time.
    // Skipping compareSync on missing users leaks valid usernames via timing.
    const hashToCompare = user ? user.password : DUMMY_HASH;
    const isPasswordValid = bcrypt.compareSync(args.password, hashToCompare);

    if (!user || !isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // SECURITY FIX: Generate cryptographically secure random token
    // Instead of base64-encoding username:password (which can be easily decoded),
    // we generate a random 32-byte token that cannot be reverse-engineered
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const token = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

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
    // PERFORMANCE: Use by_token index for fast lookup
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
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
    // PERFORMANCE: Use by_token index for fast lookup
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
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
    // Token required unless this is the very first user (bootstrap)
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if any users exist already
    const userCount = await ctx.db.query("users").first();

    if (userCount !== null) {
      // Users exist - require admin auth to create more
      if (!args.token) {
        throw new Error("Authentication required to create additional users");
      }
      // Import requireAuth inline to check admin role
      const session = await ctx.db
        .query("sessions")
        .withIndex("by_token", (q) => q.eq("token", args.token!))
        .first();
      if (!session || session.expiresAt < Date.now()) {
        throw new Error("Invalid or expired session");
      }
      const callerUser = await ctx.db.get(session.userId);
      if (!callerUser || callerUser.role !== "admin") {
        throw new Error("Admin permissions required to create users");
      }
    }

    // SECURITY FIX: Validate all inputs
    const validatedName = validateString(args.name, "Username", MAX_LENGTHS.USERNAME);
    const validatedEmail = validateEmail(args.email);
    validatePassword(args.password);

    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), validatedName))
      .first();

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = bcrypt.hashSync(args.password, 10);

    const userId = await ctx.db.insert("users", {
      name: validatedName,
      email: validatedEmail,
      password: hashedPassword,
      role: args.role || "user",
    });

    return { userId };
  },
});

export const getAllUsers = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Validate token in query context
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) return null;
    const callerUser = await ctx.db.get(session.userId);
    if (!callerUser || callerUser.role !== "admin") return null;

    const users = await ctx.db.query("users").collect();
    return users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }));
  },
});
