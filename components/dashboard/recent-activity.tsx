import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  PLATFORM_LABELS,
  COUNTRY_LABELS,
  type Platform,
  type Country,
} from "@/lib/schemas/enums";

interface FunnelEntry {
  id: string;
  week_start: string;
  platform: Platform;
  country: Country;
  spend_usd: number;
  leads: number;
  sal1: number;
  created_at: string;
}

interface CampaignUpload {
  snapshot_id: string;
  campaign_id: string;
  campaign_name: string;
  period_end: string;
  score: number | null;
  created_at: string;
}

const formatUsd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

export function RecentActivity({
  funnelEntries,
  campaignUploads,
}: {
  funnelEntries: FunnelEntry[];
  campaignUploads: CampaignUpload[];
}) {
  return (
    <div className="border-border bg-bg space-y-4 rounded-md border p-5">
      <h3 className="text-foreground text-sm">Recent activity</h3>

      <div>
        <h4 className="text-muted-foreground mb-2 text-xs uppercase tracking-wide">
          Funnel entries
        </h4>
        {funnelEntries.length === 0 ? (
          <p className="text-muted-foreground text-sm">No entries yet.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {funnelEntries.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground tabular-nums">
                  {format(parseISO(e.week_start), "d MMM")}
                </span>
                <span className="text-foreground">
                  {PLATFORM_LABELS[e.platform]} · {COUNTRY_LABELS[e.country]}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {formatUsd(e.spend_usd)} · {e.leads} leads · {e.sal1} SAL1
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4 className="text-muted-foreground mb-2 text-xs uppercase tracking-wide">
          Campaign snapshots
        </h4>
        {campaignUploads.length === 0 ? (
          <p className="text-muted-foreground text-sm">No snapshots yet.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {campaignUploads.map((s) => (
              <li key={s.snapshot_id} className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground tabular-nums">
                  {format(parseISO(s.period_end), "d MMM")}
                </span>
                <Link
                  href={`/campaigns/${s.campaign_id}`}
                  className="text-foreground hover:text-brand-gold underline-offset-4 hover:underline"
                >
                  {s.campaign_name}
                </Link>
                {s.score !== null && (
                  <span className="text-muted-foreground text-xs">Rated {s.score}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
