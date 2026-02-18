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
import { COMMISSION_STATUSES, DRAFT_AUTO_SAVE_INTERVAL, ROUTES, ERROR_MESSAGES, FORM_INPUT_CLASS, FORM_TEXTAREA_CLASS, FORM_SELECT_CLASS, FORM_LABEL_CLASS } from "@/lib/constants";
import { getAuthToken, getAuthTokenOrRedirect } from "@/lib/auth-utils";

export default function CreateCommissionPage() {
  const router = useRouter();
  const addCommission = useMutation(api.content.commissions.addCommission);
  const upsertDraft = useMutation(api.content.drafts.upsertDraft);
  const deleteDraft = useMutation(api.content.drafts.deleteDraft);
  const { isAdmin, isLoading: authLoading } = useAdminAuth({ redirectTo: "/commission", requireAuth: true });
  const { uploadFile, isUploading } = useFileUpload();
  const [token] = useState(() => getAuthToken() ?? "");
  const draft = useQuery(api.content.drafts.getDraft, { type: "commission", token });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<typeof COMMISSION_STATUSES[number]>("Todo");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const stateRef = useRef({ title, description, tags, status });

  useEffect(() => {
    stateRef.current = { title, description, tags, status };
  }, [title, description, tags, status]);

  useEffect(() => {
    if (draft?.data && !draftLoaded) {
      const draftData = draft.data as {
        title?: string;
        description?: string;
        tags?: string[];
        status?: typeof COMMISSION_STATUSES[number];
        cover?: string;
      };
      if (draftData.title) setTitle(draftData.title);
      if (draftData.description) setDescription(draftData.description);
      if (draftData.tags) setTags(draftData.tags);
      if (draftData.status) setStatus(draftData.status);
      // Note: Can't restore File object from draft, only storageId reference
      setDraftLoaded(true);
    }
  }, [draft, draftLoaded]);

  useEffect(() => {
    const interval = setInterval(() => {
      const formData = {
        title: stateRef.current.title.trim(),
        description: stateRef.current.description.trim(),
        tags: stateRef.current.tags,
        status: stateRef.current.status,
      };

      upsertDraft({
        type: "commission",
        data: formData,
        token,
      });
    }, DRAFT_AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [upsertDraft]);

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const formData = getFormData();
      
      await upsertDraft({
        type: "commission",
        data: formData,
        token,
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
      status: stateRef.current.status,
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

    const token = getAuthTokenOrRedirect(router, ROUTES.COMMISSION, "You must be logged in to create a commission");

    setIsSubmitting(true);

    try {
      let coverStorageId: string | undefined = undefined;

      if (selectedFile) {
        coverStorageId = await uploadFile(selectedFile, token);
      }

      await addCommission({
        ...formData,
        cover: coverStorageId,
        token,
      });

      await deleteDraft({ type: "commission", token });
      router.push(ROUTES.COMMISSION);
    } catch (error) {
      console.error("Error creating commission:", error);
      alert(ERROR_MESSAGES.CREATE_FAILED("commission"));
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
        <PageHeader title="Create Commission" cancelHref={ROUTES.COMMISSION} />

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
              placeholder="Enter commission title"
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
              placeholder="Enter commission description"
              required
            />
          </div>

          <TagSelector selectedTags={tags} onChange={setTags} token={token} />

          <div>
            <label className={FORM_LABEL_CLASS}>
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof COMMISSION_STATUSES[number])}
              className={FORM_SELECT_CLASS}
            >
              {COMMISSION_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <FileUpload
            accept="image/*"
            onFileSelect={handleFileSelect}
            preview={coverPreview}
          />

          <div className="flex gap-4">
            <DrawOutlineButton
              type="submit"
              disabled={isSubmitting || isSavingDraft}
              className={isSubmitting || isSavingDraft ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isSubmitting ? (isUploading ? "Uploading..." : "Creating...") : "Create Commission"}
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
