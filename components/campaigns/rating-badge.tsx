import { Badge } from "@/components/ui/badge";
import type { RatingBand } from "@/lib/schemas/enums";

const BAND_LABELS: Record<RatingBand, string> = {
  excellent: "Excellent",
  good: "Good",
  average: "Average",
  underperforming: "Underperforming",
  poor: "Poor",
};

const BAND_CLASSES: Record<RatingBand, string> = {
  excellent: "bg-success text-white border-transparent",
  good: "bg-steel text-white border-transparent",
  average: "bg-surface text-brand-black border-border",
  underperforming: "bg-mauve text-white border-transparent",
  poor: "bg-destructive text-white border-transparent",
};

export function ratingBadge(score: number, band: RatingBand | null) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-foreground text-sm tabular-nums">{score}</span>
      {band && <Badge className={BAND_CLASSES[band]}>{BAND_LABELS[band]}</Badge>}
    </span>
  );
}
