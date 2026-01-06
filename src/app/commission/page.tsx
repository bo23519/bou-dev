"use client";

import { useState, useEffect, useMemo } from "react";
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

const calculateColumnsFromAspectRatio = (aspectRatio: number, width: number): number => {
  // Map aspect ratios to column counts
  // 32:9 (3.56) => 7 columns
  // 21:9 (2.33) => 5 columns
  // 16:9 (1.78) => 4 columns
  
  // Mobile fallback: use 1 column on small screens
  if (width < 640) return 1;
  
  // Use exact aspect ratio values
  const AR_32_9 = 32 / 9; // ≈ 3.556
  const AR_21_9 = 21 / 9; // ≈ 2.333
  const AR_16_9 = 16 / 9; // ≈ 1.778
  
  if (aspectRatio >= AR_32_9) return 7;
  if (aspectRatio >= AR_21_9) {
    // Interpolate between 21:9 (5) and 32:9 (7)
    const ratio = (aspectRatio - AR_21_9) / (AR_32_9 - AR_21_9);
    return Math.round(4 + ratio * 2);
  }
  if (aspectRatio >= AR_16_9) {
    // Interpolate between 16:9 (4) and 21:9 (5)
    const ratio = (aspectRatio - AR_16_9) / (AR_21_9 - AR_16_9);
    return Math.round(4 + ratio * 1);
  }
  // For narrower screens, use fewer columns
  if (aspectRatio >= 1.5) return 3;
  if (aspectRatio >= 1.2) return 2;
  return 1;
};

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
  const [numOfColumns, setNumOfColumns] = useState(5);

  useEffect(() => {
    const calculateColumns = () => {
      if (typeof window === "undefined") return;
      const width = window.innerWidth;
      const aspectRatio = width / window.innerHeight;
      const columns = calculateColumnsFromAspectRatio(aspectRatio, width);
      setNumOfColumns(columns);
    };

    calculateColumns();
    window.addEventListener("resize", calculateColumns);
    return () => window.removeEventListener("resize", calculateColumns);
  }, []);

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

  const filteredCommissions = useMemo(() => {
    if (!commissions) return [];
    return commissions.filter(
      (c) => c.deletedAt === undefined || c.deletedAt === null
    );
  }, [commissions]);

  const colOfCards = useMemo(() => {
    const columns: Commission[][] = Array(numOfColumns).fill(null).map(() => []);
    filteredCommissions.forEach((commission, index) => {
      const columnIndex = index % numOfColumns;
      columns[columnIndex].push(commission);
    });
    return columns;
  }, [filteredCommissions, numOfColumns]);

  if (commissions === undefined) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </main>
    );
  }

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
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${numOfColumns}, minmax(0, 1fr))`,
              gridAutoRows: "min-content",
            }}
          >
            {colOfCards.map((column, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-4">
                {column.map((commission) => (
                  <CommissionCard key={commission._id} commission={commission} isAdmin={isAdmin} router={router} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
