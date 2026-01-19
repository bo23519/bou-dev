"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { TipTapEditor } from "@/components/editor/TipTapEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { DrawOutlineButton } from "@/components/ui/button";
import { TagSelector } from "@/components/tags/TagSelector";

export default function CreatePage() {
  const router = useRouter();
  const addBlogPost = useMutation(api.content.blogPosts.addBlogPost);
  const upsertDraft = useMutation(api.content.drafts.upsertDraft);
  const deleteDraft = useMutation(api.content.drafts.deleteDraft);
  const draft = useQuery(api.content.drafts.getDraft, { type: "blog" });

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (draft?.data) {
      const draftData = draft.data as { title?: string; content?: string; tags?: string[] };
      if (draftData.title) setTitle(draftData.title);
      if (draftData.content) setContent(draftData.content);
      if (draftData.tags) setTags(draftData.tags);
    }
  }, [draft]);

  useEffect(() => {
    const interval = setInterval(() => {
      upsertDraft({
        type: "blog",
        data: {
          title,
          content,
          tags,
        },
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [title, content, tags, upsertDraft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await addBlogPost({
        title: title.trim(),
        content,
        tags,
      });

      await deleteDraft({ type: "blog" });
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

          <TagSelector selectedTags={tags} onChange={setTags} />

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
