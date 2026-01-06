export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center text-muted-foreground">{message}</div>
      </div>
    </main>
  );
}
