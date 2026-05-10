import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Sign-in failed · TFO Performance Marketing",
};

export default function AuthCodeErrorPage() {
  return (
    <main className="bg-bg flex min-h-screen items-center justify-center px-6 py-12">
      <div className="border-border w-full max-w-sm rounded-md border bg-white p-8">
        <h1 className="mb-2 text-2xl">Sign-in failed</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          The link is invalid, has expired, or your email is not authorised. Try requesting a new
          link.
        </p>
        <Link href="/login" className={buttonVariants({ className: "w-full" })}>
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
