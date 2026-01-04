"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { DrawOutlineButton } from "@/components/ui/button";

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
  const addCommission = useMutation(api.commissions.addCommission);
  const verifyTokenMutation = useMutation((api as any).auth.verifyToken);
  const generateUploadUrl = useMutation((api as any).files.generateUploadUrl);
  const saveFileRecord = useMutation((api as any).files.saveFileRecord);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<typeof STATUS_OPTIONS[number]>("Todo");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const result = await verifyTokenMutation({ token });
          if (result?.valid && result.role === "admin") {
            setIsAdmin(true);
          } else {
            router.push("/commission");
          }
        } catch (error) {
          router.push("/commission");
        }
      } else {
        router.push("/commission");
      }
    };
    checkAuth();
  }, [verifyTokenMutation, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setCoverPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Title and description are required");
      return;
    }

    setIsSubmitting(true);
    setIsUploading(selectedFile !== null);

    try {
      let coverStorageId: string | undefined = undefined;

      if (selectedFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        const { storageId } = await result.json();

        await saveFileRecord({
          storageId: storageId as string,
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
        });

        coverStorageId = storageId;
      }

      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await addCommission({
        title: title.trim(),
        description: description.trim(),
        tags: tagsArray,
        status,
        cover: coverStorageId,
      });

      router.push("/commission");
    } catch (error) {
      console.error("Error creating commission:", error);
      alert("Failed to create commission");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
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
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-foreground">Create Commission</h1>
          <DrawOutlineButton onClick={() => router.push("/commission")}>
            Cancel
          </DrawOutlineButton>
        </div>

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

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#EFF0EF] focus:outline-none focus:ring-2 focus:ring-[#D8FA00]"
              placeholder="e.g., Design, Frontend, Backend"
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Cover Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#EFF0EF] focus:outline-none focus:ring-2 focus:ring-[#D8FA00] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#D8FA00] file:text-black hover:file:bg-[#C8E600]"
            />
            {coverPreview && (
              <div className="mt-4 relative">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="max-w-full max-h-64 rounded-lg border border-zinc-700"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

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
