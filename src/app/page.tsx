"use client";

import { useEffect, useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LazyHorizontalScrollCarousel } from "@/components/carousel/horizontalScrollCarousel/LazyHorizontalScrollCarousel";
import { SmoothScrollHero } from "@/components/hero/SmoothScrollHeroSection";
import { useLoadingTriggers } from "@/contexts/LoadingTriggersContext";
import dynamic from "next/dynamic";

const LazyCommissionsPreview = dynamic(
  () => import("@/components/commission/LazyCommissionsPreview").then((mod) => mod.LazyCommissionsPreview),
  { ssr: false }
);

const LazyBlogsPreview = dynamic(
  () => import("@/components/blog/LazyBlogsPreview").then((mod) => mod.LazyBlogsPreview),
  { ssr: false }
);

export default function Home() {
  const addView = useMutation((api as any).stats.addView);
  const { shouldLoadCommissions, shouldLoadBlogs, triggerCommissions, triggerBlogs } = useLoadingTriggers();
  const [hasScrolled, setHasScrolled] = useState(false);
  const commissionsTriggerRef = useRef<HTMLDivElement>(null);
  const blogsTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    addView();
  }, [addView]);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasScrolled) {
        setHasScrolled(true);
      }

      if (commissionsTriggerRef.current) {
        const rect = commissionsTriggerRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight + 500 && !shouldLoadCommissions) {
          triggerCommissions();
        }
      }

      if (blogsTriggerRef.current) {
        const rect = blogsTriggerRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight + 500 && !shouldLoadBlogs) {
          triggerBlogs();
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasScrolled, shouldLoadCommissions, shouldLoadBlogs, triggerCommissions, triggerBlogs]);

  return (
    <main className="min-h-screen bg-background ">
      {/* Hero Section */}
      <SmoothScrollHero />
      
      <div className="mx-auto max-w-4xl space-y-8 p-8">

        {/* Project showcases - Moved outside the max-w-4xl container */}
        <div className="mt-16" id="projects">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#D8FA00]">Featured Projects</h2>
          <LazyHorizontalScrollCarousel />
        </div>

        {/* Commissions Preview - Loads when scrolling further */}
        <div ref={commissionsTriggerRef} className="mt-16" id="commissions">
          {shouldLoadCommissions && (
            <>
              <h2 className="text-3xl font-bold text-center mb-8 text-[#D8FA00]">Commissions</h2>
              <LazyCommissionsPreview />
            </>
          )}
        </div>

        {/* Blogs Preview - Loads when scrolling even further */}
        <div ref={blogsTriggerRef} className="mt-16" id="blogs">
          {shouldLoadBlogs && (
            <>
              <h2 className="text-3xl font-bold text-center mb-8 text-[#D8FA00]">Latest Blog Posts</h2>
              <LazyBlogsPreview />
            </>
          )}
        </div>

      </div>
    </main>
  );
}
