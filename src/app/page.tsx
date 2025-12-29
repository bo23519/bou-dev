"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import HorizontalScrollCarousel from "@/components/carousel/horizontalScrollCarousel/HorizontalScrollCarousel";
import { SmoothScrollHero } from "@/components/hero/SmoothScrollHeroSection";

export default function Home() {
  const addView = useMutation((api as any).stats.addView);

  useEffect(() => {
    addView();
  }, [addView]);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <SmoothScrollHero />
      
      <div className="mx-auto max-w-4xl space-y-8 p-8">

        {/* Project showcases - Moved outside the max-w-4xl container */}
        <div className="mt-16" id="projects">
          <h2 className="text-3xl font-bold text-center mb-8">Featured Projects</h2>
          <HorizontalScrollCarousel />
        </div>

      </div>
    </main>
  );
}
