# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
```bash
# Start both Convex backend and Next.js dev server (recommended)
# Terminal 1: Convex dev server (watches convex/ directory, auto-deploys)
npx convex dev

# Terminal 2: Next.js development server
npm run dev
```

### Building and Linting
```bash
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint
```

### Convex Database Operations
```bash
# Deploy Convex functions to production
npx convex deploy

# Import data from JSONL files
npx convex import --table projects local/projects.jsonl --replace
npx convex import --table links local/links.jsonl --replace
npx convex import --table blogPosts local/blogPosts.jsonl --replace
npx convex import --table commissions local/commissions.jsonl --replace

# Import to production (add --prod flag)
npx convex import --table projects local/projects_prod.jsonl --replace --prod
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14 (App Router) with TypeScript and Tailwind CSS
- **Backend**: Convex (real-time database + serverless functions)
- **Animation**: Framer Motion for scroll effects and parallax
- **Styling**: Tailwind CSS + shadcn/ui components
- **Editor**: TipTap for markdown editing

### Key Architectural Patterns

#### 1. Convex Backend Organization
The backend is organized into three main categories in `convex/`:

- **`content/`**: Content management (blogPosts, commissions, projects, drafts)
- **`storage/`**: File uploads and asset management
- **`system/`**: Auth, stats, cleanup tasks, links, tags
- **`lib/`**: Shared utilities (auth middleware, validation)

All mutations are protected by the `requireAuth()` middleware defined in `convex/lib/auth.ts`, which validates tokens and admin roles.

#### 2. Authentication Flow
Token-based authentication with localStorage:
- Client stores token in localStorage after login
- `useAdminAuth` hook verifies token on page load
- All mutations pass token via `requireAuth()` middleware
- Sessions table indexed on `token` for fast lookups (see schema.ts)
- Session expiration is checked on each mutation

**Important**: All admin mutations MUST call `requireAuth(ctx, args.token)` first to validate the user.

#### 3. Soft Delete Pattern
Blog posts and commissions use soft deletes:
- `deletedAt` field stores deletion timestamp (optional)
- Schema has `by_deletedAt` index for efficient filtering
- Queries filter `deletedAt: undefined` to get active content
- Cron jobs (`convex/crons.ts`) clean up old soft-deleted items daily at 3am UTC

#### 4. File Upload System
Two-step upload process:
1. Client gets upload URL from `generateUploadUrl` mutation
2. Client uploads file to Convex storage
3. Client saves file metadata (storageId, name, size) to database

See `src/hooks/useFileUpload.ts` for the client-side implementation.

#### 5. Component Organization

**Admin Components** (`src/components/admin/`):
- Reusable admin UI components used across create/edit/delete pages
- `useAdminAuth` hook for authentication checks
- `DeleteConfirmationPage` for consistent delete UX
- `FileUpload` for file uploads with preview
- `PageHeader` for consistent page headers

**Content Components**:
- `editor/TipTapEditor.tsx`: Markdown editor with syntax highlighting
- `carousel/HorizontalScrollCarousel.tsx`: Project showcase with parallax
- `hero/SmoothScrollHeroSection.tsx`: Parallax hero section using Framer Motion

#### 6. Data Flow: Client ↔ Convex
```
Client Components (useQuery/useMutation)
       ↓
ConvexProvider (wraps app)
       ↓
Convex Backend (queries/mutations)
       ↓
Convex Database
```

**Real-time subscriptions**: `useQuery` automatically subscribes to data changes and re-renders when the database updates.

#### 7. App Router Structure
```
src/app/
├── blog/[id]/               # Blog post detail, edit, delete
├── commission/[id]/         # Commission detail, edit, delete
├── project/[id]/            # Project detail, edit
├── page.tsx                 # Home page (portfolio)
└── layout.tsx               # Root layout (ConvexProvider)
```

Dynamic routes use `[id]` for content by Convex document ID.

## Coding Preferences (from agents.md)

### Code Style
- Clean, short comments only when necessary
- No documentation files unless explicitly requested
- No tests unless explicitly asked
- No example code unless requested
- Focus on the requested feature only - avoid over-engineering

### Problem Solving
- Provide single best solution, not multiple options
- Step-by-step explanations when needed
- Ask key questions if requirements are vague
- Direct answers without unnecessary pleasantries

### Important Technical Notes
- **Sticky positioning**: Cannot use `position: sticky` and CSS `transform` on the same element. Use wrapper div for sticky, inner component for transforms.
- **Schema validation**: All schema fields must match data exactly. Use `v.optional()` for fields that may be missing.
- **Parallax scrolling**: Use global `scrollY` from Framer Motion, not element-relative scroll, for synchronized parallax effects.

## Database Schema Highlights

### Content Tables
- **projects**: Portfolio projects with images (storageId), tags, links, repos
- **blogPosts**: Blog posts with markdown content, tags, soft delete support
- **commissions**: Commission requests with status tracking (Backlog → Todo → In Progress → Done)

### System Tables
- **users**: Admin users with hashed passwords (bcryptjs)
- **sessions**: Auth sessions with expiration, indexed by token
- **tags**: Tag definitions with colors, indexed by name
- **links**: Social/resume links displayed in hero section
- **assets**: Keyed assets (like hero background images)

### Storage Tables
- **files**: File metadata for uploaded files
- **drafts**: Auto-saved drafts for blog/project/commission forms

All soft-deleted content has `by_deletedAt` index for performance.

## Common Development Patterns

### Creating a New Mutation
```typescript
// convex/content/example.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../lib/auth";

export const createExample = mutation({
  args: {
    token: v.string(),  // Always include token for auth
    title: v.string(),
    // ... other args
  },
  handler: async (ctx, args) => {
    // Always authenticate first
    await requireAuth(ctx, args.token);

    // Now safe to perform mutation
    const id = await ctx.db.insert("examples", {
      title: args.title,
      // ... other fields
    });

    return id;
  },
});
```

### Using Soft Delete
```typescript
// Instead of ctx.db.delete(id):
await ctx.db.patch(id, {
  deletedAt: Date.now(),
  updatedAt: Date.now(),
});
```

### Querying Active (Non-Deleted) Content
```typescript
const posts = await ctx.db
  .query("blogPosts")
  .withIndex("by_deletedAt", (q) => q.eq("deletedAt", undefined))
  .collect();
```

## Environment Variables
Required in `.env.local` (auto-generated by `npx convex dev`):
- `NEXT_PUBLIC_CONVEX_URL`: Convex deployment URL
- `CONVEX_DEPLOYMENT`: Convex deployment name

## Deployment
1. Deploy Convex: `npx convex deploy`
2. Deploy to Vercel: `vercel` (or via GitHub integration)
3. Set `NEXT_PUBLIC_CONVEX_URL` in Vercel environment variables

## Color Scheme
Inspired by Zenless Zone Zero game aesthetic. See `src/lib/colors.ts` for color constants.
