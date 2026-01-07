"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Id } from "../../../convex/_generated/dataModel";
import { formatBlogDate, BLOG_CONSTANTS } from "@/lib/blog-utils";

const ITEMS_PER_PAGE = BLOG_CONSTANTS.ITEMS_PER_PAGE;

export function LazyBlogsPreview() {
  const router = useRouter();
  const result = useQuery(api.blogPosts.getBlogPostByPage, {
    page: 1,
    itemsPerPage: 3,
  });

  const posts = (result?.page || []).filter((post): post is { 
    Id: Id<"blogPosts">; 
    Title: string; 
    Tags: string[]; 
    PublishedAt: number; 
    Image: string | undefined 
  } => post !== null);

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No blog posts found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <motion.div
          key={post.Id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => router.push(`/blog/${post.Id}`)}
          className="zzz-card cursor-pointer hover:border-[#D8FA00] transition-colors"
        >
          <Link href={`/blog/${post.Id}`}>
            <h2 className="text-white text-xl font-bold text-foreground hover:text-[#D8FA00] transition-colors duration-300 mb-2">
              {post.Title}
            </h2>
          </Link>
          <div className="flex flex-wrap gap-2 mb-2">
            {post.Tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium text-muted-foreground border border-border rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{formatBlogDate(post.PublishedAt)}</p>
        </motion.div>
      ))}
      <div className="text-center pt-4">
        <Link
          href="/blog"
          className="text-[#D8FA00] hover:underline font-medium"
        >
          View all blog posts →
        </Link>
      </div>
    </div>
  );
}
