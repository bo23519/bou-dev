"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import HorizontalScrollCarousel from "@/components/carousel/horizontalScrollCarousel/HorizontalScrollCarousel";
import { SmoothScrollHero } from "@/components/hero/SmoothScrollHeroSection";
import { LikeButton } from "@/components/likeButton/LikeButton";

export default function Home() {
  const addView = useMutation((api as any).stats.addView);

  useEffect(() => {
    addView();
  }, [addView]);

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Bou-Dev</h1>
          <div className="flex items-center gap-2">
            <LikeButton />
          </div>
        </header>

        {/* Hero Section */}
        <SmoothScrollHero />

        {/* Project showcases - Moved outside the max-w-4xl container */}
        <div className="mt-16" id="projects">
          <h2 className="text-3xl font-bold text-center mb-8">Featured Projects</h2>
          <HorizontalScrollCarousel />
        </div>

      </div>
    </main>
  );
}
