"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ArrowRightIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PLATFORM_LABELS,
  COUNTRY_LABELS,
  type Platform,
  type Country,
} from "@/lib/schemas/enums";
import {
  generateReallocations,
  applyReallocationMove,
  dismissReallocationRun,
} from "@/app/(app)/budget/actions";

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

interface RunPayload {
  summary: string;
  moves: Move[];
}

export interface RealRun {
  id: string;
  generated_at: string;
  lookback_weeks: number;
  status: "pending" | "applied" | "dismissed";
  applied_move_index: number | null;
  payload: RunPayload;
}

export function ReallocationPanel({ latestRun }: { latestRun: RealRun | null }) {
  const router = useRouter();
  const [isGenerating, startGenerate] = useTransition();
  const [appliedIdx, setAppliedIdx] = useState<number | null>(null);
  const [isMutating, startMutate] = useTransition();

  const onGenerate = () => {
    startGenerate(async () => {
      const result = await generateReallocations();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.data.moveCount === 0
          ? "Generated — model returned no clear moves."
          : `Generated ${result.data.moveCount} move${result.data.moveCount === 1 ? "" : "s"}`,
      );
      router.refresh();
    });
  };

  const onApply = (runId: string, idx: number) => {
    setAppliedIdx(idx);
    startMutate(async () => {
      const result = await applyReallocationMove(runId, idx);
      setAppliedIdx(null);
      if (result.ok) toast.success("Move applied to budget");
      else toast.error(result.error);
    });
  };

  const onDismiss = (runId: string) => {
    if (!confirm("Dismiss this run? It will not be applied.")) return;
    startMutate(async () => {
      const result = await dismissReallocationRun(runId);
      if (result.ok) toast.success("Run dismissed");
      else toast.error(result.error);
    });
  };

  return (
    <section className="border-border bg-bg space-y-4 rounded-md border p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg">Reallocation suggestions</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Generate up to 5 conservative moves based on the last 4 weeks of funnel data.
            Each move shifts ≤ 25% of the source pair&apos;s remaining monthly budget.
          </p>
        </div>
        <Button type="button" onClick={onGenerate} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate suggestions"}
        </Button>
      </div>

      {latestRun ? (
        <RunCard
          run={latestRun}
          onApply={onApply}
          onDismiss={onDismiss}
          isMutating={isMutating}
          appliedIdx={appliedIdx}
        />
      ) : (
        <p className="text-muted-foreground py-2 text-sm">
          No suggestions yet. Click <strong>Generate suggestions</strong> to ask Claude for moves.
        </p>
      )}
    </section>
  );
}

function RunCard({
  run,
  onApply,
  onDismiss,
  isMutating,
  appliedIdx,
}: {
  run: RealRun;
  onApply: (runId: string, idx: number) => void;
  onDismiss: (runId: string) => void;
  isMutating: boolean;
  appliedIdx: number | null;
}) {
  const isPending = run.status === "pending";

  return (
    <div className="border-border space-y-4 rounded-md border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-muted-foreground text-xs">
            Generated {format(parseISO(run.generated_at), "d MMM yyyy, HH:mm")} ·{" "}
            {run.lookback_weeks}-week lookback
          </div>
          <p className="text-foreground mt-1 text-sm">{run.payload.summary}</p>
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

      {run.payload.moves.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No clear moves recommended for this period.
        </p>
      ) : (
        <ul className="space-y-3">
          {run.payload.moves.map((move, idx) => {
            const wasApplied =
              run.status === "applied" && run.applied_move_index === idx;
            return (
              <li
                key={idx}
                className="border-border bg-surface space-y-2 rounded-md border p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-foreground font-normal">
                      {PLATFORM_LABELS[move.from.platform]} ·{" "}
                      {COUNTRY_LABELS[move.from.country]}
                    </span>
                    <ArrowRightIcon className="text-muted-foreground size-3.5" />
                    <span className="text-foreground font-normal">
                      {PLATFORM_LABELS[move.to.platform]} ·{" "}
                      {COUNTRY_LABELS[move.to.country]}
                    </span>
                    <Badge className="bg-brand-gold text-brand-black border-transparent">
                      Shift {formatUsd(move.shift_usd)}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      Confidence {(move.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {wasApplied ? (
                      <Badge>Applied</Badge>
                    ) : isPending ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onApply(run.id, idx)}
                        disabled={isMutating}
                      >
                        {appliedIdx === idx && isMutating ? "Applying..." : "Apply"}
                      </Button>
                    ) : null}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{move.rationale}</p>
              </li>
            );
          })}
        </ul>
      )}

      {isPending && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDismiss(run.id)}
            disabled={isMutating}
          >
            Dismiss run
          </Button>
        </div>
      )}
    </div>
  );
}
