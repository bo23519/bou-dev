"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { DrawOutlineButton } from "@/components/ui/button";
import { TipTapEditor } from "@/components/editor/TipTapEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingState } from "@/components/admin/LoadingState";
import { TagSelector } from "@/components/tags/TagSelector";
import { ROUTES, ERROR_MESSAGES, FORM_INPUT_CLASS, FORM_LABEL_CLASS } from "@/lib/constants";
import { getAuthTokenOrRedirect } from "@/lib/auth-utils";

export default function EditBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params.id;
  const idString = Array.isArray(idParam) ? idParam[0] : idParam;
  
  const isValidId = idString && typeof idString === "string" && idString !== "undefined" && idString.length > 0;
  const postId = isValidId ? (idString as Id<"blogPosts">) : undefined;

  const post = useQuery(
    api.content.blogPosts.getBlogPostById,
    postId ? { id: postId } : "skip"
  );

  const updateBlogPost = useMutation(api.content.blogPosts.updateBlogPost);

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load post data when it's available
  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setTags(post.tags || []);
      setContent(post.content || "");
      setIsLoading(false);
    } else if (post === null) {
      setIsLoading(false);
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !postId) {
      alert(ERROR_MESSAGES.TITLE_AND_CONTENT_REQUIRED);
      return;
    }

    const token = getAuthTokenOrRedirect(router, ROUTES.HOME, "You must be logged in to update a blog post");

    setIsSubmitting(true);
    try {
      await updateBlogPost({
        id: postId,
        title: title.trim(),
        content,
        tags,
        token,
      });

      router.push(`/blog/${postId}`);
    } catch (error) {
      console.error("Error updating blog post:", error);
      alert(ERROR_MESSAGES.UPDATE_FAILED("blog post"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValidId || !postId) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Invalid Post ID</h1>
          <DrawOutlineButton onClick={() => router.push(ROUTES.BLOG)}>
            Back to Blog
          </DrawOutlineButton>
        </div>
      </main>
    );
  }

  if (isLoading || post === undefined) {
    return <LoadingState />;
  }

  if (post === null) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Post Not Found or Deleted</h1>
          <DrawOutlineButton onClick={() => router.push(ROUTES.BLOG)}>
            Back to Blog
          </DrawOutlineButton>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title="Edit Blog Post" cancelHref={`/blog/${postId}`} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={FORM_LABEL_CLASS}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={FORM_INPUT_CLASS}
              placeholder="Enter blog post title"
            />
          </div>

          <TagSelector selectedTags={tags} onChange={setTags} />

          <div>
            <label className={FORM_LABEL_CLASS}>
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
