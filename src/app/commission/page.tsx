"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { DrawOutlineButton } from "@/components/ui/button";

interface Commission {
  _id: Id<"commissions">;
  title: string;
  description: string;
  tags: string[];
  cover: string | null;
  status: string;
}

interface CommissionCardProps {
  commission: Commission;
  isAdmin: boolean;
  router: any;
}

const CommissionCard = ({ commission, isAdmin, router }: CommissionCardProps) => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!commission.cover) {
      setAspectRatio(1);
      setImageLoaded(true);
      return;
    }

    const img = new Image();
    img.src = commission.cover;
    img.onload = () => {
      const ratio = img.width / img.height;
      setAspectRatio(ratio);
      setImageLoaded(true);
    };
    img.onerror = () => {
      setAspectRatio(1);
      setImageLoaded(true);
    };
  }, [commission.cover]);

  const getGridColumnSpan = () => {
    if (!aspectRatio) return 1;
    if (aspectRatio > 1.4) return 2;
    return 1;
  };

  const gridColumnSpan = getGridColumnSpan();

  if (!imageLoaded) {
    return (
      <div
        className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 animate-pulse"
        style={{ gridColumn: `span ${gridColumnSpan}` }}
      >
        <div className="aspect-video bg-zinc-800" />
        <div className="p-4 space-y-3">
          <div className="h-5 bg-zinc-800 rounded w-3/4" />
          <div className="h-4 bg-zinc-800 rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-[#D8FA00] transition-colors duration-300 cursor-pointer"
      style={{ gridColumn: `span ${gridColumnSpan}` }}
    >
      {commission.cover && (
        <div className="relative w-full overflow-hidden bg-zinc-950">
          <img
            src={commission.cover}
            alt={commission.title}
            className="w-full h-auto object-cover"
            style={{
              aspectRatio: aspectRatio ? `${aspectRatio} / 1` : "16 / 9",
            }}
          />
        </div>
      )}
      <div className="p-4 space-y-3">
        <h3 className="text-base font-semibold text-[#EFF0EF] line-clamp-2 leading-snug">
          {commission.title}
        </h3>
        <p className="text-sm text-[#787878] line-clamp-3 leading-relaxed">
          {commission.description}
        </p>
        {commission.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {commission.tags.slice(0, 3).map((tag, index) => (
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
  );
};

export default function CommissionPage() {
  const router = useRouter();
  const commissions = useQuery(api.commissions.getCommissions);
  const verifyTokenMutation = useMutation((api as any).auth.verifyToken);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const result = await verifyTokenMutation({ token });
          if (result?.valid && result.role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAuth();
  }, [verifyTokenMutation]);

  if (commissions === undefined) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </main>
    );
  }

  const filteredCommissions = commissions.filter(
    (c) => c.deletedAt === undefined || c.deletedAt === null
  );

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-foreground">Commissions</h1>
          {isAdmin && (
            <DrawOutlineButton onClick={() => router.push("/commission/create")}>
              Create Commission
            </DrawOutlineButton>
          )}
        </div>
        {filteredCommissions.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            No commissions found.
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
            style={{
              gridAutoRows: "min-content",
            }}
          >
            {filteredCommissions.map((commission) => (
              <CommissionCard key={commission._id} commission={commission} isAdmin={isAdmin} router={router} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
