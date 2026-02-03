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
import { ROUTES, ERROR_MESSAGES, FORM_INPUT_CLASS, FORM_TEXTAREA_CLASS, FORM_LABEL_CLASS } from "@/lib/constants";
import { getAuthTokenOrRedirect } from "@/lib/auth-utils";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params.id;
  const idString = Array.isArray(idParam) ? idParam[0] : idParam;

  const isValidId = idString && typeof idString === "string" && idString !== "undefined" && idString.length > 0;
  const projectId = isValidId ? (idString as Id<"projects">) : undefined;

  const project = useQuery(
    api.content.projects.getProjectById,
    projectId ? { id: projectId } : "skip"
  );

  const updateProject = useMutation(api.content.projects.updateProject);
  const { isAdmin, isLoading: authLoading } = useAdminAuth({ redirectTo: "/", requireAuth: true });
  const { uploadFile, isUploading } = useFileUpload();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [link, setLink] = useState("");
  const [repo, setRepo] = useState("");
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setDescription(project.description || "");
      setTags(project.tags || []);
      setLink(project.link || "");
      setRepo(project.repo || "");
      setExistingImage(project.storageId || null);
      setCoverPreview(project.storageId || null);
      setIsLoading(false);
    }
  }, [project]);

  if (authLoading || isLoading) {
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
      setCoverPreview(existingImage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !projectId) {
      alert(ERROR_MESSAGES.TITLE_AND_DESCRIPTION_REQUIRED);
      return;
    }

    const token = getAuthTokenOrRedirect(router, ROUTES.HOME, "You must be logged in to update a project");

    setIsSubmitting(true);

    try {
      let storageId = existingImage || "";

      if (selectedFile) {
        storageId = await uploadFile(selectedFile);
      }

      if (!storageId) {
        alert("Project image is required");
        setIsSubmitting(false);
        return;
      }

      await updateProject({
        id: projectId,
        title: title.trim(),
        description: description.trim(),
        tags,
        storageId,
        link: link.trim() || undefined,
        repo: repo.trim() || undefined,
        token,
      });

      router.push(ROUTES.HOME);
    } catch (error) {
      console.error("Error updating project:", error);
      alert(ERROR_MESSAGES.UPDATE_FAILED("project"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin || !project) {
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
        <PageHeader title="Edit Project" cancelHref="/" />

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
              disabled={isSubmitting}
              className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isSubmitting ? (isUploading ? "Uploading..." : "Updating...") : "Update Project"}
            </DrawOutlineButton>
          </div>
        </form>
      </div>
    </main>
  );
}
