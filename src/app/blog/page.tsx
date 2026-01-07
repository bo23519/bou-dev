"use client";

import { Suspense, useEffect } from "react";
import { useQuery } from "convex/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Pagination } from "@/components/blog/Pagination";
import { formatBlogDate, BLOG_CONSTANTS } from "@/lib/blog-utils";
import { useLoadingTriggers } from "@/contexts/LoadingTriggersContext";
import { TagDisplay } from "@/components/tags/TagDisplay";

const ITEMS_PER_PAGE = BLOG_CONSTANTS.ITEMS_PER_PAGE;

function BlogPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const { triggerBlogs } = useLoadingTriggers();

  useEffect(() => {
    triggerBlogs();
  }, [triggerBlogs]);

  const result = useQuery(
    api.blogPosts.getBlogPostByPage,
    {
      page: currentPage,
      itemsPerPage: ITEMS_PER_PAGE,
    }
  );

  const numOfPages = useQuery(
    api.blogPosts.getNumOfPages,
    {
      itemsPerPage: ITEMS_PER_PAGE,
    }
  );

  const posts = (result?.page || []).filter((post): post is { Id: Id<"blogPosts">; Title: string; Tags: string[]; PublishedAt: number; Image: string | undefined } => post !== null);
  const totalPages = numOfPages || 1;

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-4xl font-bold text-foreground">Blog</h1>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {posts.map((post) => (
              <motion.div
                key={post.Id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="zzz-card"
              >
                <Link href={`/blog/${post.Id}`}>
                  <h2 className="text-white text-2xl font-bold text-foreground hover:text-[#D8FA00] transition-colors duration-300 cursor-pointer mb-2">
                    {post.Title}
                  </h2>
                </Link>
                <div className="mb-2">
                  <TagDisplay tags={post.Tags} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground">{formatBlogDate(post.PublishedAt)}</p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        
        {totalPages > 1 && (
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        )}
      </div>
    </main>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </main>
    }>
      <BlogPageContent />
    </Suspense>
  );
}

