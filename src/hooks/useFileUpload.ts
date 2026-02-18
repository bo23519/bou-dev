import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useFileUpload() {
  const generateUploadUrl = useMutation(api.storage.files.generateUploadUrl);
  const saveFileRecord = useMutation(api.storage.files.saveFileRecord);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, token: string): Promise<string> => {
    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl({ token });
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      await saveFileRecord({
        storageId: storageId as string,
        name: file.name,
        type: file.type,
        size: file.size,
        token,
      });

      return storageId;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
}
