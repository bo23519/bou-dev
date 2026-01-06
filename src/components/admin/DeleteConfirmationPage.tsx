"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DrawOutlineButton } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LoadingState } from "./LoadingState";

interface DeleteConfirmationPageProps<T> {
  item: T | null | undefined;
  itemId: string | undefined;
  isValidId: boolean;
  title: string;
  itemTitle: (item: T) => string;
  itemDescription?: (item: T) => React.ReactNode;
  onDelete: () => Promise<void>;
  redirectTo: string;
  cancelHref: string;
  itemType: string;
  isLoading?: boolean;
}

export function DeleteConfirmationPage<T extends { title: string }>({
  item,
  itemId,
  isValidId,
  title,
  itemTitle,
  itemDescription,
  onDelete,
  redirectTo,
  cancelHref,
  itemType,
  isLoading = false,
}: DeleteConfirmationPageProps<T>) {
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAdminAuth({ redirectTo, requireAuth: true });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [confirmTitle, setConfirmTitle] = useState("");

  useEffect(() => {
    if (isDeleted) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            router.push(redirectTo);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isDeleted, router, redirectTo]);

  const handleDelete = async () => {
    if (!itemId || !item) return;

    if (confirmTitle.trim() !== itemTitle(item).trim()) {
      setError(`Title does not match. Please type the exact ${itemType} title to confirm deletion.`);
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await onDelete();
      setIsDeleted(true);
      setCountdown(5);
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error);
      setError(`Failed to delete ${itemType}`);
      setIsDeleting(false);
    }
  };

  if (!isValidId || !itemId) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Invalid {itemType} ID</h1>
          <DrawOutlineButton onClick={() => router.push(redirectTo)}>
            ← Back
          </DrawOutlineButton>
        </div>
      </main>
    );
  }

  if (authLoading || isLoading) {
    return <LoadingState />;
  }

  if (item === undefined) {
    return <LoadingState />;
  }

  if (item === null || isDeleted) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-4xl font-bold text-green-400 mb-4">
              {itemType} deleted successfully!
            </h1>
            <p className="text-zinc-400 text-lg">
              "{item ? itemTitle(item) : ""}" has been permanently deleted.
            </p>
            <p className="text-zinc-500">
              Redirecting in {countdown} seconds...
            </p>
            <DrawOutlineButton onClick={() => router.push(redirectTo)}>
              Go Now
            </DrawOutlineButton>
          </div>
        </div>
      </main>
    );
  }

  const isTitleMatch = confirmTitle.trim() === itemTitle(item).trim();

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-foreground">{title}</h1>
          <DrawOutlineButton onClick={() => router.push(cancelHref)}>
            Cancel
          </DrawOutlineButton>
        </div>

        <div className="space-y-4 p-6 bg-zinc-900 border border-red-500/50 rounded-lg">
          <p className="text-lg text-zinc-300">
            Are you sure you want to delete this {itemType}?
          </p>
          <div className="p-4 bg-zinc-800 rounded border border-zinc-700">
            <h2 className="text-2xl font-bold mb-2">{itemTitle(item)}</h2>
            {itemDescription && itemDescription(item)}
          </div>
          <p className="text-red-400 font-medium">
            This action cannot be undone.
          </p>
        </div>

        <div className="space-y-4 p-6 bg-zinc-900 border border-yellow-500/50 rounded-lg">
          <p className="text-lg text-zinc-300">
            To confirm deletion, please type the {itemType} title:
          </p>
          <p className="text-sm text-zinc-400 italic">
            "{itemTitle(item)}"
          </p>
          <input
            type="text"
            value={confirmTitle}
            onChange={(e) => {
              setConfirmTitle(e.target.value);
              setError(null);
            }}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-[#EFF0EF] focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder={`Type the ${itemType} title to confirm`}
            disabled={isDeleting}
          />
          {confirmTitle && !isTitleMatch && (
            <p className="text-sm text-yellow-400">
              Title does not match
            </p>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <DrawOutlineButton
            onClick={handleDelete}
            disabled={isDeleting || !isAdmin || !isTitleMatch}
            className={`${
              isDeleting || !isTitleMatch ? "opacity-50 cursor-not-allowed" : ""
            } bg-red-600 hover:bg-red-700 text-[#EFF0EF] border-red-500`}
          >
            {isDeleting ? "Deleting..." : `Delete ${itemType}`}
          </DrawOutlineButton>
        </div>
      </div>
    </main>
  );
}
