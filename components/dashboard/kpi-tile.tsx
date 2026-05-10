interface KpiTileProps {
  label: string;
  value: string;
  subtext?: string;
}

export function KpiTile({ label, value, subtext }: KpiTileProps) {
  return (
    <div className="border-border bg-bg rounded-md border p-5">
      <div className="text-muted-foreground text-xs font-normal uppercase tracking-wide">
        {label}
      </div>
      <div className="text-foreground mt-2 text-2xl tabular-nums">{value}</div>
      {subtext && (
        <div className="text-muted-foreground mt-0.5 text-xs">{subtext}</div>
      )}
    </div>
  );
}
