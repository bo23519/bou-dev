"use client";

import { useRef, useState } from "react";

interface FileUploadProps {
  accept?: string;
  onFileSelect: (file: File | null) => void;
  preview?: string | null;
  label?: string;
}

export function FileUpload({
  accept = "image/*",
  onFileSelect,
  preview,
  label = "Cover Image",
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setPreviewUrl(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-2">
        {label}
      </label>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#EFF0EF] focus:outline-none focus:ring-2 focus:ring-[#D8FA00] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#D8FA00] file:text-black hover:file:bg-[#C8E600]"
      />
      {previewUrl && (
        <div className="mt-4 relative">
          <img
            src={previewUrl}
            alt="Preview"
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
  );
}
