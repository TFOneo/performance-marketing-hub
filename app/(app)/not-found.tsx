import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function AppNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="border-border rounded-md border p-8">
        <h1 className="mb-2 text-2xl">Page not found</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" className={buttonVariants()}>
          Back to overview
        </Link>
      </div>
    </div>
  );
}
