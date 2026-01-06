"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { DeleteConfirmationPage } from "@/components/admin/DeleteConfirmationPage";

export default function DeleteCommissionPage() {
  const params = useParams();
  const idParam = params.id;
  const idString = Array.isArray(idParam) ? idParam[0] : idParam;

  const isValidId = !!(idString && typeof idString === "string" && idString !== "undefined" && idString.length > 0);
  const commissionId = isValidId ? (idString as Id<"commissions">) : undefined;

  const commission = useQuery(
    api.commissions.getCommissionById,
    commissionId ? { id: commissionId } : "skip"
  );

  const deleteCommission = useMutation(api.commissions.deleteCommission);

  const handleDelete = async () => {
    if (!commissionId) return;
    await deleteCommission({ id: commissionId });
  };

  return (
    <DeleteConfirmationPage
      item={commission}
      itemId={commissionId}
      isValidId={isValidId}
      title="Delete Commission"
      itemTitle={(commission) => commission.title}
      itemDescription={(commission) => (
        <p className="text-zinc-400 mt-2">{commission.description}</p>
      )}
      onDelete={handleDelete}
      redirectTo="/commission"
      cancelHref="/commission"
      itemType="commission"
      isLoading={commission === undefined}
    />
  );
}
