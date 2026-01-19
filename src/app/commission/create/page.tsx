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

const STATUS_OPTIONS = [
  "Backlog",
  "Todo",
  "In progress",
  "Done",
  "Cancelled",
  "Duplicate",
] as const;

export default function CreateCommissionPage() {
  const router = useRouter();
  const addCommission = useMutation(api.content.commissions.addCommission);
  const upsertDraft = useMutation(api.content.drafts.upsertDraft);
  const deleteDraft = useMutation(api.content.drafts.deleteDraft);
  const { isAdmin, isLoading: authLoading } = useAdminAuth({ redirectTo: "/commission", requireAuth: true });
  const { uploadFile, isUploading } = useFileUpload();
  const draft = useQuery(api.content.drafts.getDraft, { type: "commission" });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<typeof STATUS_OPTIONS[number]>("Todo");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const titleRef = useRef(title);
  const descriptionRef = useRef(description);
  const tagsRef = useRef(tags);
  const statusRef = useRef(status);

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    descriptionRef.current = description;
  }, [description]);

  useEffect(() => {
    tagsRef.current = tags;
  }, [tags]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (draft?.data && !draftLoaded) {
      const draftData = draft.data as {
        title?: string;
        description?: string;
        tags?: string[];
        status?: typeof STATUS_OPTIONS[number];
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
      upsertDraft({
        type: "commission",
        data: {
          title: titleRef.current,
          description: descriptionRef.current,
          tags: tagsRef.current,
          status: statusRef.current,
        },
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [upsertDraft]);

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
    if (!title.trim() || !description.trim()) {
      alert("Title and description are required");
      return;
    }

    setIsSubmitting(true);

    try {
      let coverStorageId: string | undefined = undefined;

      if (selectedFile) {
        coverStorageId = await uploadFile(selectedFile);
      }

      await addCommission({
        title: title.trim(),
        description: description.trim(),
        tags,
        status,
        cover: coverStorageId,
      });

      await deleteDraft({ type: "commission" });
      router.push("/commission");
    } catch (error) {
      console.error("Error creating commission:", error);
      alert("Failed to create commission");
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
        <PageHeader title="Create Commission" cancelHref="/commission" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#EFF0EF] focus:outline-none focus:ring-2 focus:ring-[#D8FA00]"
              placeholder="Enter commission title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#EFF0EF] focus:outline-none focus:ring-2 focus:ring-[#D8FA00] resize-y"
              placeholder="Enter commission description"
              required
            />
          </div>

          <TagSelector selectedTags={tags} onChange={setTags} />

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof STATUS_OPTIONS[number])}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#EFF0EF] focus:outline-none focus:ring-2 focus:ring-[#D8FA00]"
            >
              {STATUS_OPTIONS.map((option) => (
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
              disabled={isSubmitting}
              className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isSubmitting ? (isUploading ? "Uploading..." : "Creating...") : "Create Commission"}
            </DrawOutlineButton>
          </div>
        </form>
      </div>
    </main>
  );
}
