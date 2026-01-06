"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload } from "lucide-react";
import { DrawOutlineButton } from "../ui/button";
import { cn } from "@/lib/utils";

interface AssetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (assetKey: string, file: File) => Promise<void>;
  isUploading: boolean;
}

const ASSET_TYPES = [
  { key: "logo", label: "Logo/Icon" },
  { key: "heroBackground", label: "Hero Background" },
] as const;

export function AssetUploadModal({
  isOpen,
  onClose,
  onUpload,
  isUploading,
}: AssetUploadModalProps) {
  const [selectedAssetType, setSelectedAssetType] = useState<string>("logo");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await onUpload(selectedAssetType, selectedFile);
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setSelectedAssetType("logo");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-black border border-zinc-800 rounded-lg shadow-xl p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#EFF0EF]">
                Upload Asset
              </h2>
              <button
                onClick={handleClose}
                className="text-[#787878] hover:text-[#EFF0EF] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Asset Type
                </label>
                <select
                  value={selectedAssetType}
                  onChange={(e) => setSelectedAssetType(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#EFF0EF] focus:outline-none focus:ring-2 focus:ring-[#D8FA00]"
                >
                  {ASSET_TYPES.map((type) => (
                    <option key={type.key} value={type.key}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Image File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#EFF0EF] focus:outline-none focus:ring-2 focus:ring-[#D8FA00] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#D8FA00] file:text-black hover:file:bg-[#C8E600]"
                />
              </div>

              {preview && (
                <div className="mt-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full max-h-64 rounded-lg border border-zinc-700"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <DrawOutlineButton
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className={cn(
                    "flex-1",
                    (!selectedFile || isUploading) &&
                      "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <Upload className="w-4 h-4 animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    "Upload"
                  )}
                </DrawOutlineButton>
                <DrawOutlineButton
                  onClick={handleClose}
                  className="flex-1"
                  color="#787878"
                >
                  Cancel
                </DrawOutlineButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
