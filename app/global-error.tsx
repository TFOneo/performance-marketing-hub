"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global:error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-white text-black">
        <main className="flex min-h-screen items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm rounded-md border border-neutral-200 bg-white p-8">
            <h1 className="mb-2 text-2xl">Something went wrong</h1>
            <p className="mb-6 text-sm text-neutral-500">
              The app hit an unexpected error. Try refreshing.
            </p>
            <button
              type="button"
              onClick={reset}
              className="bg-neutral-900 px-4 py-2 text-sm text-white"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
