"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { DrawOutlineButton } from "@/components/ui/button";
import { formatBlogDate } from "@/lib/blog-utils";
import { TagDisplay } from "@/components/tags/TagDisplay";

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params.id;
  const idString = Array.isArray(idParam) ? idParam[0] : idParam;
  
  // Validate that we have a valid ID string (not undefined, null, or "undefined")
  const isValidId = idString && typeof idString === "string" && idString !== "undefined" && idString.length > 0;
  const postId = isValidId ? (idString as Id<"blogPosts">) : undefined;

  const post = useQuery(
    api.blogPosts.getBlogPostById,
    postId ? { id: postId } : "skip"
  );

  const [isAdmin, setIsAdmin] = useState(false);
  const verifyTokenMutation = useMutation((api as any).auth.verifyToken);

  // Redirect immediately to blog list if post is deleted
  useEffect(() => {
    if (post === null && postId) {
      router.push("/blog");
    }
  }, [post, postId, router]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const result = await verifyTokenMutation({ token });
          if (result?.valid && result.role === "admin") {
            setIsAdmin(true);
          }
        } catch (error) {
          setIsAdmin(false);
        }
      }
    };
    checkAuth();
  }, [verifyTokenMutation]);

  if (!isValidId || !postId) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Invalid Post ID</h1>
            <Link href="/blog" className="text-[#D8FA00] hover:text-[#C8E600]">
            ← Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  if (post === undefined) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </main>
    );
  }

  if (post === null) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold mb-4">Post Not Found or Deleted</h1>
            <p className="text-zinc-400 mb-4">
              This post has been deleted or doesn't exist.
            </p>
            <p className="text-zinc-500 text-sm">
              Redirecting to blog page...
            </p>
            <Link href="/blog" className="inline-block text-[#D8FA00] hover:text-[#C8E600]">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/blog"
            className="inline-block text-[#D8FA00] hover:text-[#C8E600] transition-colors"
          >
            ← Back to Blog
          </Link>
          {isAdmin && (
            <div className="flex items-center gap-2">
            <DrawOutlineButton onClick={() => router.push(`/blog/${postId}/edit`)}
            className="text-[#D8FA00]"
            >
              Edit
            </DrawOutlineButton>
            <DrawOutlineButton onClick={() => router.push(`/blog/${postId}/delete`)}
            className="text-red-300"
            >
              Delete
            </DrawOutlineButton>
            </div>
          )}
        </div>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <header className="space-y-4 mb-8">
            <h1 className="text-4xl font-bold text-foreground">{post.title}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-sm text-muted-foreground">{formatBlogDate((post as any)._creationTime)}</p>
              {post.tags && post.tags.length > 0 && (
                <TagDisplay tags={post.tags} size="sm" />
              )}
            </div>
          </header>

          <div
            className="prose prose-invert max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: (() => {
                try {
                  const jsonContent = JSON.parse(post.content);
                  return generateHTML(jsonContent, [StarterKit]);
                } catch {
                  // Fallback for old HTML content format
                  return post.content;
                }
              })()
            }}
          />
        </motion.article>
      </div>
    </main>
  );
}

