"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { DrawOutlineButton } from "@/components/ui/button";

export default function DeleteCommissionPage() {
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

  const deleteCommission = useMutation(api.commissions.deleteCommission);
  const verifyTokenMutation = useMutation((api as any).auth.verifyToken);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [confirmTitle, setConfirmTitle] = useState("");

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

  useEffect(() => {
    if (isDeleted && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isDeleted && countdown === 0) {
      router.push("/commission");
    }
  }, [isDeleted, countdown, router]);

  const handleDelete = async () => {
    if (!commissionId || !commission) {
      setError("Invalid commission ID");
      return;
    }

    if (confirmTitle !== commission.title) {
      setError("Title does not match. Please type the commission title to confirm deletion.");
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteCommission({ id: commissionId });
      setIsDeleted(true);
    } catch (error) {
      console.error("Error deleting commission:", error);
      setError("Failed to delete commission");
      setIsDeleting(false);
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

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </main>
    );
  }

  if (commission === undefined) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </main>
    );
  }

  if (commission === null || isDeleted) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold mb-4 text-[#D8FA00]">
              Commission Deleted Successfully
            </h1>
            <p className="text-zinc-400 mb-4">
              Redirecting to commissions page in {countdown} seconds...
            </p>
            <DrawOutlineButton onClick={() => router.push("/commission")}>
              Go to Commissions Now
            </DrawOutlineButton>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-foreground">Delete Commission</h1>
          <DrawOutlineButton onClick={() => router.push("/commission")}>
            Cancel
          </DrawOutlineButton>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#EFF0EF] mb-2">
              {commission.title}
            </h2>
            <p className="text-zinc-400">{commission.description}</p>
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <p className="text-red-400 mb-4">
              This action cannot be undone. The commission will be marked as deleted.
            </p>
            <p className="text-zinc-300 mb-4">
              To confirm deletion, please type the commission title:
            </p>
            <p className="text-sm font-mono text-zinc-500 mb-2">
              {commission.title}
            </p>
            <input
              type="text"
              value={confirmTitle}
              onChange={(e) => {
                setConfirmTitle(e.target.value);
                setError(null);
              }}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-[#EFF0EF] focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Type the commission title to confirm"
            />
            {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
          </div>

          <div className="flex gap-4 pt-4">
            <DrawOutlineButton
              onClick={handleDelete}
              disabled={isDeleting || confirmTitle !== commission.title}
              color="#DB3C30"
              className={
                isDeleting || confirmTitle !== commission.title
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }
            >
              {isDeleting ? "Deleting..." : "Delete Commission"}
            </DrawOutlineButton>
          </div>
        </div>
      </div>
    </main>
  );
}
