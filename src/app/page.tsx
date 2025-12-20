import HorizontalScrollCarousel, { HorizontalScrollCarouselExample } from "@/components/carousel/horizontalScrollCarousel/HorizontalScrollCarousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SmoothScrollHero } from "@/components/hero/SmoothScrollHeroSection";
import { Introduction } from "@/components/hero/Introduction";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Portfolio</h1>
          <Button variant="outline">Sign In</Button>
        </header>

        {/* Hero Section */}
        <SmoothScrollHero />

        <Introduction />


        {/* Project showcases - Moved outside the max-w-4xl container */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Featured Projects</h2>
          <HorizontalScrollCarousel />
        </div>

        {/* Guestbook Section */}
        <Card>
          <CardHeader>
            <CardTitle>Guestbook</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Implement Optimistic UI here */}
            <p className="text-muted-foreground">
              Guestbook entries will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
