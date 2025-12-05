import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <section className="py-12 text-center">
          <h2 className="text-4xl font-bold tracking-tight">Hello World</h2>
          <p className="mt-4 text-muted-foreground">
            Welcome to my portfolio. This is the scaffolding.
          </p>
        </section>

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
