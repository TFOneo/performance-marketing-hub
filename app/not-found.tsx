import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function GlobalNotFound() {
  return (
    <main className="bg-bg flex min-h-screen items-center justify-center px-6 py-12">
      <div className="border-border w-full max-w-sm rounded-md border bg-white p-8">
        <h1 className="mb-2 text-2xl">Page not found</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" className={buttonVariants({ className: "w-full" })}>
          Go to overview
        </Link>
      </div>
    </main>
  );
}
