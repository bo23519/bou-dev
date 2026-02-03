/**
 * Shared constants used across the application
 * This file provides a single source of truth for values used in multiple places
 */

// ============================================
// COMMISSION STATUS
// ============================================
export const COMMISSION_STATUSES = [
  "Backlog",
  "Todo",
  "In progress",
  "Done",
  "Cancelled",
  "Duplicate",
] as const;

export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];

// ============================================
// FORM STYLING
// ============================================
export const FORM_INPUT_CLASS =
  "w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#EFF0EF] focus:outline-none focus:ring-2 focus:ring-[#D8FA00]";

export const FORM_TEXTAREA_CLASS =
  "w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#EFF0EF] focus:outline-none focus:ring-2 focus:ring-[#D8FA00] min-h-[100px]";

export const FORM_SELECT_CLASS =
  "w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#EFF0EF] focus:outline-none focus:ring-2 focus:ring-[#D8FA00]";

export const FORM_LABEL_CLASS = "block text-sm font-medium text-zinc-300 mb-2";

// ============================================
// ROUTES
// ============================================
export const ROUTES = {
  HOME: "/",
  BLOG: "/blog",
  BLOG_CREATE: "/blog/create",
  BLOG_EDIT: (id: string) => `/blog/${id}/edit`,
  BLOG_DELETE: (id: string) => `/blog/${id}/delete`,
  COMMISSION: "/commission",
  COMMISSION_CREATE: "/commission/create",
  COMMISSION_EDIT: (id: string) => `/commission/${id}/edit`,
  COMMISSION_DELETE: (id: string) => `/commission/${id}/delete`,
  PROJECT: "/project",
  PROJECT_CREATE: "/project/create",
  PROJECT_EDIT: (id: string) => `/project/${id}/edit`,
} as const;

// ============================================
// VALIDATION LIMITS
// ============================================
export const VALIDATION = {
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 5000,
  CONTENT_MAX_LENGTH: 50000,
  TAG_MAX_COUNT: 10,
  TAG_NAME_MAX_LENGTH: 50,
} as const;

// ============================================
// DRAFT AUTO-SAVE
// ============================================
export const DRAFT_AUTO_SAVE_INTERVAL = 15000; // 15 seconds

// ============================================
// AUTH
// ============================================
export const AUTH_TOKEN_KEY = "authToken";

// ============================================
// ERROR MESSAGES
// ============================================
export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "You must be logged in to perform this action",
  TITLE_REQUIRED: "Title is required",
  CONTENT_REQUIRED: "Content is required",
  DESCRIPTION_REQUIRED: "Description is required",
  TITLE_AND_DESCRIPTION_REQUIRED: "Title and description are required",
  TITLE_AND_CONTENT_REQUIRED: "Title and content are required",
  CREATE_FAILED: (type: string) => `Failed to create ${type}`,
  UPDATE_FAILED: (type: string) => `Failed to update ${type}`,
  DELETE_FAILED: (type: string) => `Failed to delete ${type}`,
} as const;
