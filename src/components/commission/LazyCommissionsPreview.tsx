"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Id } from "../../../convex/_generated/dataModel";

interface Commission {
  _id: Id<"commissions">;
  title: string;
  description: string;
  tags: string[];
  cover: string | null;
  status: string;
}

export function LazyCommissionsPreview() {
  const router = useRouter();
  const { results: commissions } = usePaginatedQuery(
    api.commissions.getCommissions,
    {},
    { initialNumItems: 3 }
  );

  if (!commissions || commissions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No commissions found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {commissions.slice(0, 6).map((commission) => (
        <motion.div
          key={commission._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => router.push(`/commission`)}
          className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700 cursor-pointer hover:border-[#D8FA00] transition-colors"
        >
          {commission.cover && (
            <div className="relative w-full h-48 overflow-hidden bg-zinc-950">
              <img
                src={commission.cover}
                alt={commission.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-4 space-y-2">
            <h3 className="text-base font-semibold text-[#EFF0EF] line-clamp-2">
              {commission.title}
            </h3>
            <p className="text-sm text-[#787878] line-clamp-2">
              {commission.description}
            </p>
            {commission.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {commission.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-xs font-medium text-[#787878] border border-zinc-700 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
      <div className="col-span-full text-center pt-4">
        <Link
          href="/commission"
          className="text-[#D8FA00] hover:underline font-medium"
        >
          View all commissions →
        </Link>
      </div>
    </div>
  );
}
