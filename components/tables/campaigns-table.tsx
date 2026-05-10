"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  PLATFORM_LABELS,
  COUNTRY_LABELS,
  type Platform,
  type Country,
  type CampaignStatus,
  type RatingBand,
} from "@/lib/schemas/enums";
import { ratingBadge } from "@/components/campaigns/rating-badge";

const STATUS_LABELS: Record<CampaignStatus, string> = {
  active: "Active",
  paused: "Paused",
  ended: "Ended",
};

export interface CampaignsRow {
  id: string;
  name: string;
  platform: Platform;
  country: Country;
  status: CampaignStatus;
  latest_rating: { score: number; band: RatingBand | null } | null;
  last_uploaded_at: string | null;
}

export function CampaignsTable({ rows }: { rows: CampaignsRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="border-border bg-bg rounded-md border p-8 text-center">
        <p className="text-muted-foreground text-sm">
          No campaigns yet. Click <strong>New campaign</strong> to register one.
        </p>
      </div>
    );
  }

  return (
    <div className="border-border overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Latest rating</TableHead>
            <TableHead>Last upload</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-surface">
              <TableCell>
                <Link
                  href={`/campaigns/${row.id}`}
                  className="text-foreground hover:text-brand-gold underline-offset-4 hover:underline"
                >
                  {row.name}
                </Link>
              </TableCell>
              <TableCell>{PLATFORM_LABELS[row.platform]}</TableCell>
              <TableCell>{COUNTRY_LABELS[row.country]}</TableCell>
              <TableCell>
                <Badge variant={row.status === "active" ? "default" : "outline"}>
                  {STATUS_LABELS[row.status]}
                </Badge>
              </TableCell>
              <TableCell>
                {row.latest_rating
                  ? ratingBadge(row.latest_rating.score, row.latest_rating.band)
                  : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {row.last_uploaded_at
                  ? format(parseISO(row.last_uploaded_at), "d MMM yyyy")
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
