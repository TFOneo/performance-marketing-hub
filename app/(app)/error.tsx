"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app:error]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="border-border rounded-md border p-8">
        <h1 className="mb-2 text-2xl">Something went wrong</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          The page hit an unexpected error. Try again, and if it persists, check the server logs.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
