"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { TipTapEditor, TipTapEditorRef } from "@/components/editor/TipTapEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { DrawOutlineButton } from "@/components/ui/button";
import { TagSelector } from "@/components/tags/TagSelector";
import { DRAFT_AUTO_SAVE_INTERVAL, ROUTES, ERROR_MESSAGES, FORM_INPUT_CLASS, FORM_LABEL_CLASS } from "@/lib/constants";
import { getAuthTokenOrRedirect } from "@/lib/auth-utils";

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
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const editorRef = useRef<TipTapEditorRef>(null);
  const stateRef = useRef({ title, tags, content });

  useEffect(() => {
    stateRef.current = { title, tags, content };
  }, [title, tags, content]);

  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    if (draft && draft.data && !draftLoaded) {
      const draftData = draft.data as { title?: string; content?: string; tags?: string[] };
      
      if (draftData.title) setTitle(draftData.title);
      if (draftData.content) setContent(draftData.content);
      if (draftData.tags) setTags(draftData.tags);
      
      setDraftLoaded(true);
    }
    
    if (draft === null && !draftLoaded) {
      setDraftLoaded(true);
    }
  }, [draft, draftLoaded]);

  useEffect(() => {
    const saveDraft = async () => {
      try {
        const editorContent = editorRef.current?.getCurrentContent();
        const stateContent = stateRef.current.content;
        const currentContent = editorContent || stateContent;
        
        const formData = {
          title: stateRef.current.title.trim(),
          content: currentContent,
          tags: stateRef.current.tags,
        };
        
        await upsertDraft({
          type: "blog",
          data: formData,
        });
      } catch (error) {
        console.error("Error auto-saving draft:", error);
      }
    };
    
    const interval = setInterval(saveDraft, DRAFT_AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [upsertDraft]);

  const getFormData = () => {
    const currentContent = editorRef.current?.getCurrentContent() || stateRef.current.content;
    return {
      title: stateRef.current.title.trim(),
      content: currentContent,
      tags: stateRef.current.tags,
    };
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const editorContent = editorRef.current?.getCurrentContent();
      const stateContent = stateRef.current.content;
      const currentContent = editorContent || stateContent;
      
      const formData = {
        title: stateRef.current.title.trim(),
        content: currentContent,
        tags: stateRef.current.tags,
      };
      
      await upsertDraft({
        type: "blog",
        data: formData,
      });
      
      alert("Draft saved successfully!");
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = getFormData();

    if (!formData.title || !formData.content.trim()) {
      alert(ERROR_MESSAGES.TITLE_AND_CONTENT_REQUIRED);
      return;
    }

    const token = getAuthTokenOrRedirect(router, ROUTES.HOME, "You must be logged in to create a blog post");

    setIsSubmitting(true);
    try {
      await addBlogPost({ ...formData, token });

      await deleteDraft({ type: "blog" });
      router.push(ROUTES.BLOG);
    } catch (error) {
      console.error("Error creating blog post:", error);
      alert(ERROR_MESSAGES.CREATE_FAILED("blog post"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title="Create Blog Post" cancelHref={ROUTES.BLOG} />

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
            <TipTapEditor ref={editorRef} content={content} onChange={setContent} />
          </div>

          <div className="flex gap-4">
            <DrawOutlineButton
              type="submit"
              disabled={isSubmitting || isSavingDraft}
              className={isSubmitting || isSavingDraft ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isSubmitting ? "Publishing..." : "Publish"}
            </DrawOutlineButton>
            <DrawOutlineButton
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isSubmitting}
              className={isSavingDraft || isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isSavingDraft ? "Saving..." : "Save as Draft"}
            </DrawOutlineButton>
          </div>
        </form>
      </div>
    </main>
  );
}
