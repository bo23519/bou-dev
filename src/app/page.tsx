"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../convex/_generated/api";
import { SmoothScrollHero } from "@/components/hero/SmoothScrollHeroSection";
import { HorizontalScrollCarousel } from "@/components/carousel/horizontalScrollCarousel/HorizontalScrollCarousel";
import { ArrowRight } from "lucide-react";
import { TagDisplay } from "@/components/tags/TagDisplay";

export default function Home() {
  const addView = useMutation(api.system.stats.addView);
  const latestCommission = useQuery(api.content.commissions.getLatestCommission);
  const latestBlogPost = useQuery(api.content.blogPosts.getLatestBlogPost);
  const assets = useQuery(api.storage.assets.getAssets);
  const heroBackgroundUrl = assets?.heroBackground?.url;

  // BUG FIX: Prevent duplicate view counting in React StrictMode
  // StrictMode runs effects twice in dev, causing double counting
  const viewCounted = useRef(false);

  useEffect(() => {
    // Only count view once per mount
    if (!viewCounted.current) {
      addView();
      viewCounted.current = true;
    }
  }, [addView]);

  return (
    <main className="min-h-screen bg-background ">
      {/* Hero Section */}
      <SmoothScrollHero />
      
      <div className="mx-auto max-w-4xl space-y-8 p-8">

        {/* Project showcases */}
        <div className="mt-16" id="projects">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#D8FA00]">Featured Projects</h2>
          <HorizontalScrollCarousel />
        </div>

        {/* Preview Cards */}
        <div className="mt-16" id="more">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#D8FA00]">Discover More</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Latest Commission Card */}
          <Link href="/commission" className="group">
            <div className="relative overflow-hidden rounded-xl bg-zinc-900 border border-zinc-700 transition-all duration-300 hover:border-[#D8FA00] hover:shadow-lg hover:shadow-[#D8FA00]/10 h-full flex flex-col">
              {/* Cover Image */}
              <div className="h-40 overflow-hidden flex-shrink-0">
                {latestCommission?.cover ? (
                  <img
                    src={latestCommission.cover}
                    alt={latestCommission.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full bg-gradient-to-br from-[#D8FA00]/20 to-zinc-800 flex items-center justify-center">
                    <span className="text-[#D8FA00] text-4xl font-bold opacity-30">Commission</span>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#D8FA00] uppercase tracking-wider">Latest Commission</span>
                  <ArrowRight className="w-4 h-4 text-[#D8FA00] transform group-hover:translate-x-1 transition-transform" />
                </div>
                
                {latestCommission ? (
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-[#EFF0EF] line-clamp-1">{latestCommission.title}</h3>
                    <div className="mt-3">
                      <TagDisplay tags={latestCommission.tags} maxTags={3} size="sm" />
                    </div>
                  </div>
                  
                ) : (
                  <p className="text-zinc-500 italic">No commissions yet</p>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-8 w-4/5 mx-auto text-center">
                Tickets for myself to work on. <br />Board inspired by Zenless Zone Zero.
              </p>
            </div>
          </Link>

          {/* Latest Blog Card */}
          <Link href="/blog" className="group">
            <div className="relative overflow-hidden rounded-xl bg-zinc-900 border border-zinc-700 transition-all duration-300 hover:border-[#22C6CE] hover:shadow-lg hover:shadow-[#22C6CE]/10 h-full flex flex-col">
              {/* Header Image */}
              <div className="h-40 overflow-hidden flex-shrink-0 relative">
                {heroBackgroundUrl ? (
                  <>
                    <img
                      src={heroBackgroundUrl}
                      alt="Blog"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
                  </>
                ) : (
                  <div className="h-full bg-gradient-to-br from-[#22C6CE]/20 to-zinc-800 flex items-center justify-center">
                    <span className="text-[#22C6CE] text-4xl font-bold opacity-30">Blog</span>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#22C6CE] uppercase tracking-wider">Latest Post</span>
                  <ArrowRight className="w-4 h-4 text-[#22C6CE] transform group-hover:translate-x-1 transition-transform" />
                </div>
                
                {latestBlogPost ? (
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-[#EFF0EF] line-clamp-1">{latestBlogPost.title}</h3>
                    <div className="flex-1" />
                    <div className="mt-3">
                      <TagDisplay tags={latestBlogPost.tags} maxTags={3} size="sm" />
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-500 italic">No blog posts yet</p>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-8 w-4/5 mx-auto text-center">
                Blog posts about my learning and thoughts.
                <br />
                Practice my writing and expressions.
              </p>
            </div>
          </Link>
        </div>


        <p className="text-sm text-muted-foreground mb-8 w-4/5 mx-auto text-center">
        This site's design and color scheme are inspired by the game <a href="https://zenless.hoyoverse.com/" className="text-[#D8FA00]">Zenless Zone Zero</a>. <br/>
        Hero section/Horizontal scroll carousel/Draw outline button etc. are from <a href="https://www.hover.dev/components/" className="text-[#5349E6]">Hover</a>.
        </p>

      </div>
    </main>
  );
}
