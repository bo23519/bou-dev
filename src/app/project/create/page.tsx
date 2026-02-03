"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { DrawOutlineButton } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useFileUpload } from "@/hooks/useFileUpload";
import { PageHeader } from "@/components/admin/PageHeader";
import { FileUpload } from "@/components/admin/FileUpload";
import { LoadingState } from "@/components/admin/LoadingState";
import { TagSelector } from "@/components/tags/TagSelector";
import { DRAFT_AUTO_SAVE_INTERVAL, ROUTES, ERROR_MESSAGES, FORM_INPUT_CLASS, FORM_TEXTAREA_CLASS, FORM_LABEL_CLASS } from "@/lib/constants";
import { getAuthTokenOrRedirect } from "@/lib/auth-utils";

export default function CreateProjectPage() {
  const router = useRouter();
  const addProject = useMutation(api.content.projects.addProject);
  const upsertDraft = useMutation(api.content.drafts.upsertDraft);
  const deleteDraft = useMutation(api.content.drafts.deleteDraft);
  const { isAdmin, isLoading: authLoading } = useAdminAuth({ redirectTo: "/", requireAuth: true });
  const { uploadFile, isUploading } = useFileUpload();
  const draft = useQuery(api.content.drafts.getDraft, { type: "project" });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [link, setLink] = useState("");
  const [repo, setRepo] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const stateRef = useRef({ title, description, tags, link, repo });

  useEffect(() => {
    stateRef.current = { title, description, tags, link, repo };
  }, [title, description, tags, link, repo]);

  useEffect(() => {
    if (draft?.data && !draftLoaded) {
      const draftData = draft.data as {
        title?: string;
        description?: string;
        tags?: string[];
        link?: string;
        repo?: string;
        storageId?: string;
      };
      if (draftData.title) setTitle(draftData.title);
      if (draftData.description) setDescription(draftData.description);
      if (draftData.tags) setTags(draftData.tags);
      if (draftData.link) setLink(draftData.link);
      if (draftData.repo) setRepo(draftData.repo);
      if (draftData.storageId) {
        // Note: Can't restore File object from draft, only storageId reference
        // User will need to re-upload file if needed
      }
      setDraftLoaded(true);
    }
  }, [draft, draftLoaded]);

  useEffect(() => {
    const interval = setInterval(() => {
      const formData = {
        title: stateRef.current.title.trim(),
        description: stateRef.current.description.trim(),
        tags: stateRef.current.tags,
        link: stateRef.current.link.trim() || undefined,
        repo: stateRef.current.repo.trim() || undefined,
      };
      
      upsertDraft({
        type: "project",
        data: formData,
      });
    }, DRAFT_AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [upsertDraft]);

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const formData = getFormData();
      
      await upsertDraft({
        type: "project",
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

  const getFormData = () => {
    return {
      title: stateRef.current.title.trim(),
      description: stateRef.current.description.trim(),
      tags: stateRef.current.tags,
      link: stateRef.current.link.trim() || undefined,
      repo: stateRef.current.repo.trim() || undefined,
    };
  };

  if (authLoading) {
    return <LoadingState />;
  }

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCoverPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = getFormData();

    if (!formData.title || !formData.description) {
      alert(ERROR_MESSAGES.TITLE_AND_DESCRIPTION_REQUIRED);
      return;
    }

    if (!selectedFile) {
      alert("Project image is required");
      return;
    }

    const token = getAuthTokenOrRedirect(router, ROUTES.HOME, "You must be logged in to create a project");

    setIsSubmitting(true);

    try {
      const storageId = await uploadFile(selectedFile);

      await addProject({
        ...formData,
        storageId,
        token,
      });

      await deleteDraft({ type: "project" });
      router.push(ROUTES.HOME);
    } catch (error) {
      console.error("Error creating project:", error);
      alert(ERROR_MESSAGES.CREATE_FAILED("project"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title="Create Project" cancelHref="/" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={FORM_LABEL_CLASS}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={FORM_INPUT_CLASS}
              placeholder="Enter project title"
              required
            />
          </div>

          <div>
            <label className={FORM_LABEL_CLASS}>
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className={FORM_TEXTAREA_CLASS + " resize-y"}
              placeholder="Enter project description"
              required
            />
          </div>

          <TagSelector selectedTags={tags} onChange={setTags} />

          <div>
            <label className={FORM_LABEL_CLASS}>
              Project Link (optional)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className={FORM_INPUT_CLASS}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className={FORM_LABEL_CLASS}>
              Repository Link (optional)
            </label>
            <input
              type="url"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className={FORM_INPUT_CLASS}
              placeholder="https://github.com/username/repo"
            />
          </div>

          <FileUpload
            accept="image/*"
            onFileSelect={handleFileSelect}
            preview={coverPreview}
            label="Project Image *"
          />

          <div className="flex gap-4">
            <DrawOutlineButton
              type="submit"
              disabled={isSubmitting || isSavingDraft}
              className={isSubmitting || isSavingDraft ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isSubmitting ? (isUploading ? "Uploading..." : "Creating...") : "Create Project"}
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
