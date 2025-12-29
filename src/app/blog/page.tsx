"use client";

import { useTransition } from "react";
import { useQuery } from "convex/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { Pagination } from "@/components/blog/Pagination";

const ITEMS_PER_PAGE = 10;

const formatDate = (timestamp: number | undefined): string => {
  if (!timestamp) return "No date";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function BlogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const result = useQuery(api.blogPosts.getBlogPostByPage, {
    page: currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const numOfPages = useQuery(api.blogPosts.getNumOfPages, {
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const posts = result?.page || [];
  const totalPages = numOfPages || 1;

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-4xl font-bold">Blog</h1>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {isPending && (
              <div className="text-center text-muted-foreground">Loading...</div>
            )}
            {posts.map((post: { Id: string; Title: string; Tags: string[]; PublishedAt: number | undefined; Image: string | undefined }) => (
              <motion.div
                key={post.Id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/blog/${post.Id}`}>
                  <h2 className="text-2xl font-bold hover:text-indigo-300 transition-colors cursor-pointer">
                    {post.Title}
                  </h2>
                </Link>
                <p className="text-lg text-muted-foreground">{post.Tags.join(", ")}</p>
                <p className="text-lg text-muted-foreground">{formatDate(post.PublishedAt)}</p>
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

