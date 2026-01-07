/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as content_blogPosts from "../content/blogPosts.js";
import type * as content_commissions from "../content/commissions.js";
import type * as content_projects from "../content/projects.js";
import type * as crons from "../crons.js";
import type * as storage_assets from "../storage/assets.js";
import type * as storage_files from "../storage/files.js";
import type * as system_auth from "../system/auth.js";
import type * as system_cleanup from "../system/cleanup.js";
import type * as system_links from "../system/links.js";
import type * as system_stats from "../system/stats.js";
import type * as system_tags from "../system/tags.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "content/blogPosts": typeof content_blogPosts;
  "content/commissions": typeof content_commissions;
  "content/projects": typeof content_projects;
  crons: typeof crons;
  "storage/assets": typeof storage_assets;
  "storage/files": typeof storage_files;
  "system/auth": typeof system_auth;
  "system/cleanup": typeof system_cleanup;
  "system/links": typeof system_links;
  "system/stats": typeof system_stats;
  "system/tags": typeof system_tags;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
