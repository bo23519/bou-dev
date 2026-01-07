"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
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

export default function EditCommissionPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params.id;
  const idString = Array.isArray(idParam) ? idParam[0] : idParam;

  const isValidId = idString && typeof idString === "string" && idString !== "undefined" && idString.length > 0;
  const commissionId = isValidId ? (idString as Id<"commissions">) : undefined;

  const commission = useQuery(
    api.commissions.getCommissionById,
    commissionId ? { id: commissionId } : "skip"
  );

  const updateCommission = useMutation(api.commissions.updateCommission);
  const { isAdmin, isLoading: authLoading } = useAdminAuth({ redirectTo: "/commission", requireAuth: true });
  const { uploadFile, isUploading } = useFileUpload();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<typeof STATUS_OPTIONS[number]>("Todo");
  const [existingCover, setExistingCover] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (commission) {
      setTitle(commission.title || "");
      setDescription(commission.description || "");
      setTags(commission.tags || []);
      setStatus(commission.status || "Todo");
      setExistingCover(commission.cover || null);
      setCoverPreview(commission.cover || null);
      setIsLoading(false);
    } else if (commission === null) {
      setIsLoading(false);
    }
  }, [commission]);

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
      setCoverPreview(existingCover);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !commissionId) {
      alert("Title and description are required");
      return;
    }

    setIsSubmitting(true);

    try {
      let coverStorageId: string | undefined = existingCover || undefined;

      if (selectedFile) {
        coverStorageId = await uploadFile(selectedFile);
      }

      await updateCommission({
        id: commissionId,
        title: title.trim(),
        description: description.trimEnd(),
        updatedAt: Date.now(),
        tags,
        status,
        cover: coverStorageId,
      });

      router.push("/commission");
    } catch (error) {
      console.error("Error updating commission:", error);
      alert("Failed to update commission");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValidId || !commissionId) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Invalid Commission ID</h1>
          <DrawOutlineButton onClick={() => router.push("/commission")}>
            ← Back to Commissions
          </DrawOutlineButton>
        </div>
      </main>
    );
  }

  if (!isAdmin || isLoading) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </main>
    );
  }

  if (commission === null) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold mb-4">Commission Not Found or Deleted</h1>
            <p className="text-zinc-400 mb-4">
              This commission has been deleted or doesn't exist.
            </p>
            <DrawOutlineButton onClick={() => router.push("/commission")}>
              ← Back to Commissions
            </DrawOutlineButton>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title="Edit Commission" cancelHref="/commission" />

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
              {isSubmitting ? (isUploading ? "Uploading..." : "Updating...") : "Update Commission"}
            </DrawOutlineButton>
          </div>
        </form>
      </div>
    </main>
  );
}
