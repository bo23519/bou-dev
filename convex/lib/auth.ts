import { MutationCtx } from "../_generated/server";

/**
 * Authentication middleware for protecting mutations.
 *
 * SECURITY FIX: This middleware ensures that only authenticated admin users
 * can perform mutations (create, update, delete operations).
 *
 * Previously, all mutations were unprotected - anyone could call them directly
 * via the Convex API without authentication. This was a critical security flaw.
 *
 * @param ctx - Convex mutation context
 * @param token - Authentication token from the client
 * @returns Session and user information if authenticated
 * @throws Error if token is invalid or user is not an admin
 */
export async function requireAuth(ctx: MutationCtx, token: string | undefined) {
  // SECURITY CHECK #1: Verify token was provided
  if (!token) {
    throw new Error("Authentication required: No token provided");
  }

  // SECURITY CHECK #2: Verify token exists in sessions table
  const session = await ctx.db
    .query("sessions")
    .filter((q) => q.eq(q.field("token"), token))
    .first();

  if (!session) {
    throw new Error("Authentication required: Invalid token");
  }

  // SECURITY CHECK #3: Verify token hasn't expired
  if (session.expiresAt < Date.now()) {
    // Clean up expired session
    await ctx.db.delete(session._id);
    throw new Error("Authentication required: Token expired");
  }

  // SECURITY CHECK #4: Verify user still exists
  const user = await ctx.db.get(session.userId);
  if (!user) {
    throw new Error("Authentication required: User not found");
  }

  // SECURITY CHECK #5: Verify user has admin role
  // This prevents regular users from performing admin actions
  if (user.role !== "admin") {
    throw new Error("Authorization required: Admin role required");
  }

  // All checks passed - return authenticated session info
  return {
    userId: user._id,
    username: user.name,
    role: user.role,
    sessionId: session._id,
  };
}
