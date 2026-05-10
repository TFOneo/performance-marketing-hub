"use client";

import { useTransition } from "react";
import { format, parseISO } from "date-fns";
import { MoreHorizontalIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ratingBadge } from "@/components/campaigns/rating-badge";
import { deleteSnapshot } from "@/app/(app)/campaigns/actions";
import type { RatingBand } from "@/lib/schemas/enums";

const formatUsd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

export interface CampaignSnapshotRow {
  id: string;
  period_start: string;
  period_end: string;
  spend_usd: number;
  leads: number;
  sql1: number;
  sal1: number;
  client: number;
  ai_rating_score: number | null;
  ai_rating_band: RatingBand | null;
  ai_rating_rationale: string | null;
  ai_recommendations: string[] | null;
  ai_rated_at: string | null;
}

export function CampaignSnapshotsTable({
  rows,
  campaignId,
  onRerate,
}: {
  rows: CampaignSnapshotRow[];
  campaignId: string;
  onRerate?: (snapshotId: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  if (rows.length === 0) {
    return (
      <div className="border-border bg-bg rounded-md border p-8 text-center">
        <p className="text-muted-foreground text-sm">
          No snapshots yet. Upload one above to get an AI rating.
        </p>
      </div>
    );
  }

  const onDelete = (id: string) => {
    if (!confirm("Delete this snapshot? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteSnapshot(id, campaignId);
      if (result.ok) toast.success("Snapshot deleted");
      else toast.error(result.error);
    });
  };

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.id} className="border-border bg-bg rounded-md border p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-foreground text-sm font-normal">
                {format(parseISO(row.period_start), "d MMM")} —{" "}
                {format(parseISO(row.period_end), "d MMM yyyy")}
              </div>
              <div className="text-muted-foreground mt-0.5 text-xs">
                Saved {format(parseISO(row.ai_rated_at ?? row.period_end), "d MMM")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {row.ai_rating_score !== null
                ? ratingBadge(row.ai_rating_score, row.ai_rating_band)
                : (
                    <span className="text-muted-foreground text-xs">No rating</span>
                  )}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="hover:bg-surface focus-visible:ring-ring inline-flex size-8 items-center justify-center rounded-md outline-none focus-visible:ring-2"
                  aria-label="Snapshot actions"
                >
                  <MoreHorizontalIcon className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onRerate && row.ai_rating_score === null && (
                    <DropdownMenuItem onClick={() => onRerate(row.id)}>
                      Re-rate
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={isPending}
                    onClick={() => onDelete(row.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Spend</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>SQL1</TableHead>
                <TableHead>SAL1</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>$/SAL1</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="tabular-nums">{formatUsd(row.spend_usd)}</TableCell>
                <TableCell className="tabular-nums">{row.leads}</TableCell>
                <TableCell className="tabular-nums">{row.sql1}</TableCell>
                <TableCell className="tabular-nums">{row.sal1}</TableCell>
                <TableCell className="tabular-nums">{row.client}</TableCell>
                <TableCell className="tabular-nums">
                  {row.sal1 > 0 ? formatUsd(row.spend_usd / row.sal1) : "—"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {row.ai_rating_rationale && (
            <div className="mt-4 space-y-2">
              <p className="text-foreground text-sm">{row.ai_rating_rationale}</p>
              {row.ai_recommendations && row.ai_recommendations.length > 0 && (
                <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                  {row.ai_recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
