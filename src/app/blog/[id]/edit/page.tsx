"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { TipTapEditor } from "@/components/editor/TipTapEditor";
import { DrawOutlineButton } from "@/components/ui/button";

export default function EditBlogPostPage() {
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

  const updateBlogPost = useMutation(api.blogPosts.updateBlogPost);

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load post data when it's available
  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setTags(post.tags ? post.tags.join(", ") : "");
      setContent(post.content || "");
      setIsLoading(false);
    } else if (post === null) {
      setIsLoading(false);
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !postId) {
      alert("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await updateBlogPost({
        id: postId,
        title: title.trim(),
        content,
        tags: tagsArray,
      });

      router.push(`/blog/${postId}`);
    } catch (error) {
      console.error("Error updating blog post:", error);
      alert("Failed to update blog post");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (isLoading || post === undefined) {
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

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Edit Blog Post</h1>
          <DrawOutlineButton onClick={() => router.push(`/blog/${postId}`)}>
            Cancel
          </DrawOutlineButton>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter blog post title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., React, TypeScript, Next.js"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Content
            </label>
            <TipTapEditor content={content} onChange={setContent} />
          </div>

          <div className="flex gap-4">
            <DrawOutlineButton
              type="submit"
              disabled={isSubmitting}
              className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </DrawOutlineButton>
          </div>
        </form>
      </div>
    </main>
  );
}
