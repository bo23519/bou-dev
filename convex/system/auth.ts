import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
// SECURITY FIX: Import bcryptjs for password hashing
import bcrypt from "bcryptjs";
// SECURITY FIX: Import validation utilities
import { validateString, validateEmail, validatePassword, MAX_LENGTHS } from "../lib/validation";

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

    // Don't reveal whether username or password was wrong (security best practice)
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // SECURITY FIX: Compare password using bcrypt instead of plaintext comparison
    // This securely verifies the password against the hashed version in the database
    // Using synchronous method as Convex mutations don't support async setTimeout
    const isPasswordValid = bcrypt.compareSync(args.password, user.password);

    // Don't reveal whether username or password was wrong (security best practice)
    if (!isPasswordValid) {
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
  },
  handler: async (ctx, args) => {
    // SECURITY FIX: Validate all inputs
    const validatedName = validateString(args.name, "Username", MAX_LENGTHS.USERNAME);
    const validatedEmail = validateEmail(args.email);
    validatePassword(args.password); // Throws if invalid

    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), validatedName))
      .first();

    if (existingUser) {
      throw new Error("User already exists");
    }

    // SECURITY FIX: Hash password with bcrypt before storing
    // Uses 10 salt rounds for a good balance of security and performance
    // Never store plaintext passwords in the database!
    // Using synchronous method as Convex mutations don't support async setTimeout
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

// TEMPORARY QUERY: Check if any users exist in the database
// This will help verify if the admin account was imported
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    // Don't return passwords for security
    return users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }));
  },
});

// MIGRATION: One-time function to hash existing plaintext passwords
// Run this once to convert your existing password to bcrypt hash
// After running, this function can be removed
export const migratePasswordToHash = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.username))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      return { message: "Password is already hashed", alreadyHashed: true };
    }

    // Hash the current plaintext password using synchronous method
    const hashedPassword = bcrypt.hashSync(user.password, 10);

    // Update user with hashed password
    await ctx.db.patch(user._id, {
      password: hashedPassword,
    });

    return {
      message: "Password successfully migrated to bcrypt hash",
      alreadyHashed: false,
    };
  },
});
