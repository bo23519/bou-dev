"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { DrawOutlineButton } from "@/components/ui/button";

export default function DeleteBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params.id;
  const idString = Array.isArray(idParam) ? idParam[0] : idParam;
  
  const isValidId = idString && typeof idString === "string" && idString !== "undefined" && idString.length > 0;
  const postId = isValidId ? (idString as Id<"blogPosts">) : undefined;

  const post = useQuery(
    api.blogPosts.getBlogPostById,
    postId ? { id: postId } : "skip"
  );

  const deleteBlogPost = useMutation(api.blogPosts.deleteBlogPost);
  const verifyTokenMutation = useMutation((api as any).auth.verifyToken);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [confirmTitle, setConfirmTitle] = useState("");

  // Check admin status
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const result = await verifyTokenMutation({ token });
          if (result?.valid && result.role === "admin") {
            setIsAdmin(true);
          } else {
            router.push("/blog");
          }
        } catch (error) {
          router.push("/blog");
        }
      } else {
        router.push("/blog");
      }
    };
    checkAuth();
  }, [verifyTokenMutation, router]);

  // Countdown and redirect after deletion
  useEffect(() => {
    if (isDeleted) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            router.push("/blog");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isDeleted, router]);


  const handleDelete = async () => {
    if (!postId || !post) return;

    // Validate title confirmation
    if (confirmTitle.trim() !== post.title.trim()) {
      setError("Title does not match. Please type the exact title to confirm deletion.");
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteBlogPost({ id: postId });
      setIsDeleted(true);
      setCountdown(5);
    } catch (error) {
      console.error("Error deleting blog post:", error);
      setError("Failed to delete blog post");
      setIsDeleting(false);
    }
  };

  const isTitleMatch = confirmTitle.trim() === (post?.title || "").trim();

  if (!isValidId || !postId) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Invalid Post ID</h1>
          <DrawOutlineButton onClick={() => router.push("/blog")}>
            Back to Blog
          </DrawOutlineButton>
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
          <h1 className="text-4xl font-bold mb-4">Post Not Found or Deleted</h1>
          <DrawOutlineButton onClick={() => router.push("/blog")}>
            Back to Blog
          </DrawOutlineButton>
        </div>
      </main>
    );
  }

  if (isDeleted) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-4xl font-bold text-green-400 mb-4">
              Blog post deleted successfully!
            </h1>
            <p className="text-zinc-400 text-lg">
              "{post.title}" has been permanently deleted.
            </p>
            <p className="text-zinc-500">
              Redirecting to blog page in {countdown} seconds...
            </p>
            <DrawOutlineButton onClick={() => router.push("/blog")}>
              Go to Blog Now
            </DrawOutlineButton>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Delete Blog Post</h1>
          <DrawOutlineButton onClick={() => router.push(`/blog/${postId}`)}>
            Cancel
          </DrawOutlineButton>
        </div>

        <div className="space-y-4 p-6 bg-zinc-900 border border-red-500/50 rounded-lg">
          <p className="text-lg text-zinc-300">
            Are you sure you want to delete this blog post?
          </p>
          <div className="p-4 bg-zinc-800 rounded border border-zinc-700">
            <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {post.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-zinc-700 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className="text-red-400 font-medium">
            This action cannot be undone.
          </p>
        </div>

        <div className="space-y-4 p-6 bg-zinc-900 border border-yellow-500/50 rounded-lg">
          <p className="text-lg text-zinc-300">
            To confirm deletion, please type the blog post title:
          </p>
          <p className="text-sm text-zinc-400 italic">
            "{post.title}"
          </p>
          <input
            type="text"
            value={confirmTitle}
            onChange={(e) => {
              setConfirmTitle(e.target.value);
              setError(null);
            }}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Type the blog post title to confirm"
            disabled={isDeleting}
          />
          {confirmTitle && !isTitleMatch && (
            <p className="text-sm text-yellow-400">
              Title does not match
            </p>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <DrawOutlineButton
            onClick={handleDelete}
            disabled={isDeleting || !isAdmin || !isTitleMatch}
            className={`${
              isDeleting || !isTitleMatch ? "opacity-50 cursor-not-allowed" : ""
            } bg-red-600 hover:bg-red-700 text-white border-red-500`}
          >
            {isDeleting ? "Deleting..." : "Delete Post"}
          </DrawOutlineButton>
        </div>
      </div>
    </main>
  );
}
