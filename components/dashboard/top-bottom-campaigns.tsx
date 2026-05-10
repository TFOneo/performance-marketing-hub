import Link from "next/link";
import { ratingBadge } from "@/components/campaigns/rating-badge";
import {
  PLATFORM_LABELS,
  COUNTRY_LABELS,
  type Platform,
  type Country,
  type RatingBand,
} from "@/lib/schemas/enums";

interface Ranked {
  id: string;
  name: string;
  platform: Platform;
  country: Country;
  score: number;
  band: string | null;
}

export function TopBottomCampaigns({
  top,
  bottom,
}: {
  top: Ranked[];
  bottom: Ranked[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Top performers" rows={top} empty="No rated campaigns yet." />
      <Section title="Bottom performers" rows={bottom} empty="No rated campaigns yet." />
    </div>
  );
}

function Section({ title, rows, empty }: { title: string; rows: Ranked[]; empty: string }) {
  return (
    <div className="border-border bg-bg rounded-md border p-5">
      <h3 className="text-foreground mb-4 text-sm">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/campaigns/${r.id}`}
                  className="text-foreground hover:text-brand-gold block truncate text-sm underline-offset-4 hover:underline"
                >
                  {r.name}
                </Link>
                <div className="text-muted-foreground text-xs">
                  {PLATFORM_LABELS[r.platform]} · {COUNTRY_LABELS[r.country]}
                </div>
              </div>
              <div className="shrink-0">
                {ratingBadge(r.score, (r.band as RatingBand | null) ?? null)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
