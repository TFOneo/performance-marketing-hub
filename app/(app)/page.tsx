import { signOut } from "./sign-out/actions";
import { Button } from "@/components/ui/button";

export default function OverviewPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            KPI tiles, trends, and top performers — wired in M10.
          </p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </main>
  );
}
