import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import {
  PLATFORM_LABELS,
  COUNTRY_LABELS,
  type Platform,
  type Country,
} from "@/lib/schemas/enums";

const formatUsd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

interface Move {
  from: { platform: Platform; country: Country };
  to: { platform: Platform; country: Country };
  shift_usd: number;
  rationale: string;
  confidence: number;
}

export default async function ReallocationsHistoryPage() {
  const supabase = await createClient();
  const { data: runs } = await supabase
    .from("reallocation_runs")
    .select("id, generated_at, lookback_weeks, status, applied_move_index, payload")
    .order("generated_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/budget"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeftIcon className="size-3.5" />
        Back to budget
      </Link>

      <PageHeader
        title="Past suggestions"
        description="The 50 most recent reallocation runs."
      />

      {!runs || runs.length === 0 ? (
        <div className="border-border bg-bg rounded-md border p-8 text-center">
          <p className="text-muted-foreground text-sm">No runs yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {runs.map((run) => {
            const payload = run.payload as unknown as { summary: string; moves: Move[] };
            return (
              <div
                key={run.id}
                className="border-border bg-bg space-y-3 rounded-md border p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-muted-foreground text-xs">
                      {format(parseISO(run.generated_at), "d MMM yyyy, HH:mm")} ·{" "}
                      {run.lookback_weeks}-week lookback
                    </div>
                    <p className="text-foreground mt-1 text-sm">{payload.summary}</p>
                  </div>
                  <Badge
                    variant={
                      run.status === "applied"
                        ? "default"
                        : run.status === "dismissed"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {run.status}
                  </Badge>
                </div>

                {payload.moves.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No moves recommended.</p>
                ) : (
                  <ul className="space-y-2">
                    {payload.moves.map((m, idx) => (
                      <li
                        key={idx}
                        className="bg-surface flex flex-wrap items-center gap-2 rounded-md p-2 text-sm"
                      >
                        <span className="text-foreground">
                          {PLATFORM_LABELS[m.from.platform]} ·{" "}
                          {COUNTRY_LABELS[m.from.country]}
                        </span>
                        <ArrowRightIcon className="text-muted-foreground size-3.5" />
                        <span className="text-foreground">
                          {PLATFORM_LABELS[m.to.platform]} ·{" "}
                          {COUNTRY_LABELS[m.to.country]}
                        </span>
                        <span className="text-muted-foreground tabular-nums">
                          {formatUsd(m.shift_usd)}
                        </span>
                        {run.status === "applied" && run.applied_move_index === idx && (
                          <Badge>Applied</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
