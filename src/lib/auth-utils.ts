/**
 * Authentication utility functions
 * Provides reusable auth-related operations to eliminate duplication
 */

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { AUTH_TOKEN_KEY, ERROR_MESSAGES } from "./constants";

/**
 * Retrieves the auth token from localStorage and redirects if not found
 *
 * @param router - Next.js router instance
 * @param redirectPath - Path to redirect to if token is missing (default: "/")
 * @param errorMessage - Custom error message to display (default: ERROR_MESSAGES.AUTH_REQUIRED)
 * @returns The auth token if found
 * @throws Error if token is not found (after alerting user and redirecting)
 */
export function getAuthTokenOrRedirect(
  router: AppRouterInstance,
  redirectPath: string = "/",
  errorMessage: string = ERROR_MESSAGES.AUTH_REQUIRED
): string {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (!token) {
    alert(errorMessage);
    router.push(redirectPath);
    throw new Error("Authentication token not found");
  }

  return token;
}

/**
 * Retrieves the auth token from localStorage without redirecting
 *
 * @returns The auth token if found, null otherwise
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Stores the auth token in localStorage
 *
 * @param token - The authentication token to store
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Removes the auth token from localStorage
 */
export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Checks if user is authenticated (has a token in localStorage)
 * Note: This only checks for token presence, not validity
 *
 * @returns True if token exists, false otherwise
 */
export function hasAuthToken(): boolean {
  return localStorage.getItem(AUTH_TOKEN_KEY) !== null;
}
