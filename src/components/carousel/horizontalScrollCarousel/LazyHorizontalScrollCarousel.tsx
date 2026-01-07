"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useLoadingTriggers } from "@/contexts/LoadingTriggersContext";

const HorizontalScrollCarousel = dynamic(
  () => import("./HorizontalScrollCarousel").then((mod) => mod.default),
  {
    loading: () => (
      <div className="relative h-[300vh] bg-[#121212] flex items-center justify-center">
        <div className="text-neutral-500 italic">Loading projects...</div>
      </div>
    ),
  }
);

export function LazyHorizontalScrollCarousel() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const { shouldLoadProjects, triggerProjects } = useLoadingTriggers();

  useEffect(() => {
    if (shouldLoadProjects) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            triggerProjects();
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px",
        threshold: 0.01,
      }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [shouldLoadProjects, triggerProjects]);

  return (
    <>
      <div ref={triggerRef} className="h-1" />
      {shouldLoad ? (
        <Suspense
          fallback={
            <div className="relative h-[300vh] bg-[#121212] flex items-center justify-center">
              <div className="text-neutral-500 italic">Loading projects...</div>
            </div>
          }
        >
          <HorizontalScrollCarousel />
        </Suspense>
      ) : (
        <div className="relative h-[300vh] bg-[#121212] flex items-center justify-center">
          <div className="text-neutral-500 italic">Scroll to load projects...</div>
        </div>
      )}
    </>
  );
}
