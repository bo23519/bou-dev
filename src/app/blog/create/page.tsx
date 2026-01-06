"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { TipTapEditor } from "@/components/editor/TipTapEditor";
import { PageHeader } from "@/components/admin/PageHeader";

export default function CreatePage() {
  const router = useRouter();
  const addBlogPost = useMutation(api.blogPosts.addBlogPost);

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await addBlogPost({
        title: title.trim(),
        content,
        tags: tagsArray,
      });

      router.push("/blog");
    } catch (error) {
      console.error("Error creating blog post:", error);
      alert("Failed to create blog post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title="Create Blog Post" cancelHref="/blog" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#EFF0EF] focus:outline-none focus:ring-2 focus:ring-[#D8FA00]"
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
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#EFF0EF] focus:outline-none focus:ring-2 focus:ring-[#D8FA00]"
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
              {isSubmitting ? "Publishing..." : "Publish"}
            </DrawOutlineButton>
          </div>
        </form>
      </div>
    </main>
  );
}
