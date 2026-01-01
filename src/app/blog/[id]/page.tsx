"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Interweave } from "interweave";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { DrawOutlineButton } from "@/components/ui/button";

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
          <Link href="/blog" className="text-indigo-300 hover:text-indigo-400">
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
            <Link href="/blog" className="inline-block text-indigo-300 hover:text-indigo-400">
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
            className="inline-block text-indigo-300 hover:text-indigo-400 transition-colors"
          >
            ← Back to Blog
          </Link>
          {isAdmin && (
            <div className="flex items-center gap-2">
            <DrawOutlineButton onClick={() => router.push(`/blog/${postId}/edit`)}
            className="text-indigo-300"
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
          <header className="space-y-4">
            <h1 className="text-4xl font-bold">{post.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <p>{formatDate((post as any)._creationTime)}</p>
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-2">
                  {post.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-zinc-800 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          <div className="prose prose-invert max-w-none">
            <Interweave
              content={
                (() => {
                  try {
                    const jsonContent = JSON.parse(post.content);
                    return generateHTML(jsonContent, [StarterKit]);
                  } catch {
                    // Fallback for old HTML content format
                    return post.content;
                  }
                })()
              }
              className="text-lg leading-relaxed"
            />
          </div>
        </motion.article>
      </div>
    </main>
  );
}

