"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface Commission {
  _id: Id<"commissions">;
  title: string;
  description: string;
  tags: string[];
  cover: string | null;
  status: string;
}

interface CommissionDetailModalProps {
  commission: Commission | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CommissionDetailModal({
  commission,
  isOpen,
  onClose,
  isAdmin,
  onEdit,
  onDelete,
}: CommissionDetailModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!commission) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 z-50 mx-auto max-w-6xl max-h-[90vh] overflow-hidden bg-zinc-900 rounded-lg border border-zinc-800 shadow-2xl flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {commission.cover && (
              <div className="relative w-full md:w-1/2 bg-zinc-950 overflow-hidden">
                <img
                  src={commission.cover}
                  alt={commission.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#EFF0EF] mb-3">
                  {commission.title}
                </h2>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      commission.status === "Done"
                        ? "bg-green-500/20 text-green-400"
                        : commission.status === "In progress"
                        ? "bg-blue-500/20 text-blue-400"
                        : commission.status === "Todo"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : commission.status === "Backlog"
                        ? "bg-gray-500/20 text-gray-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {commission.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-lg text-[#EFF0EF] leading-relaxed whitespace-pre-line">
                  {commission.description}
                </p>
              </div>

              {commission.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#787878] mb-2 uppercase tracking-wide">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {commission.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 text-sm font-medium text-[#787878] border border-zinc-700 rounded-lg bg-zinc-800/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {isAdmin && (onEdit || onDelete) && (
                <div className="pt-4 border-t border-zinc-800 flex gap-3">
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="px-4 py-2 bg-[#D8FA00] hover:bg-[#C8E600] text-black font-medium rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={onDelete}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
