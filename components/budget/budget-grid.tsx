"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PLATFORMS,
  COUNTRIES,
  PLATFORM_LABELS,
  COUNTRY_LABELS,
  type Platform,
  type Country,
} from "@/lib/schemas/enums";
import { upsertBudget } from "@/app/(app)/budget/actions";
import { monthInputValue, toMonthFirstISO } from "@/lib/utils/month";
import { cn } from "@/lib/utils";

interface CellData {
  planned: number;
  actual: number;
}

export interface BudgetGridProps {
  monthISO: string;
  cells: Record<Platform, Record<Country, CellData>>;
}

const formatUsd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

export function BudgetGrid({ monthISO, cells }: BudgetGridProps) {
  const router = useRouter();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Local edit buffer keyed by `${platform}_${country}` so the input shows the typed value
  // even before save, but we don't persist on every keystroke.
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const onMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw) return;
    const next = toMonthFirstISO(raw);
    router.push(`/budget?month=${next}`);
  };

  const onSavePlanned = (
    platform: Platform,
    country: Country,
    raw: string,
  ) => {
    const key = `${platform}_${country}`;
    const numeric = Number(raw);
    if (!Number.isFinite(numeric) || numeric < 0) {
      toast.error("Planned must be a non-negative number");
      return;
    }
    if (numeric === cells[platform][country].planned) {
      // No change — clear draft
      setDrafts((d) => {
        const next = { ...d };
        delete next[key];
        return next;
      });
      return;
    }
    setPendingKey(key);
    startTransition(async () => {
      const result = await upsertBudget({
        month: monthISO,
        platform,
        country,
        planned_usd: numeric,
      });
      setPendingKey(null);
      if (result.ok) {
        toast.success("Saved");
        setDrafts((d) => {
          const next = { ...d };
          delete next[key];
          return next;
        });
      } else {
        toast.error(result.error);
      }
    });
  };

  const totals = useMemo(() => {
    const byPlatform: Record<Platform, { planned: number; actual: number }> = {
      google: { planned: 0, actual: 0 },
      meta: { planned: 0, actual: 0 },
      linkedin: { planned: 0, actual: 0 },
    };
    const byCountry: Record<Country, { planned: number; actual: number }> = {
      KSA: { planned: 0, actual: 0 },
      UAE: { planned: 0, actual: 0 },
      Kuwait: { planned: 0, actual: 0 },
      Bahrain: { planned: 0, actual: 0 },
    };
    let grandPlanned = 0;
    let grandActual = 0;
    for (const p of PLATFORMS) {
      for (const c of COUNTRIES) {
        const cell = cells[p][c];
        byPlatform[p].planned += cell.planned;
        byPlatform[p].actual += cell.actual;
        byCountry[c].planned += cell.planned;
        byCountry[c].actual += cell.actual;
        grandPlanned += cell.planned;
        grandActual += cell.actual;
      }
    }
    return { byPlatform, byCountry, grandPlanned, grandActual };
  }, [cells]);

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget_month">Month</Label>
          <Input
            id="budget_month"
            type="month"
            defaultValue={monthInputValue(monthISO)}
            onChange={onMonthChange}
            className="w-44"
          />
        </div>
      </div>

      <div className="border-border overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface text-muted-foreground border-border border-b">
              <th className="px-3 py-2 text-left font-normal">Platform / Country</th>
              {COUNTRIES.map((c) => (
                <th key={c} className="px-3 py-2 text-right font-normal">
                  {COUNTRY_LABELS[c]}
                </th>
              ))}
              <th className="bg-surface px-3 py-2 text-right font-normal">Total</th>
            </tr>
          </thead>
          <tbody>
            {PLATFORMS.map((p) => (
              <tr key={p} className="border-border border-b">
                <td className="text-foreground px-3 py-2 font-normal">
                  {PLATFORM_LABELS[p]}
                </td>
                {COUNTRIES.map((c) => {
                  const cell = cells[p][c];
                  const variance = cell.actual - cell.planned;
                  const key = `${p}_${c}`;
                  const draft = drafts[key];
                  const isPending = pendingKey === key;
                  return (
                    <td key={c} className="px-2 py-2">
                      <div className="flex flex-col items-end gap-1">
                        <Input
                          type="number"
                          step="100"
                          min={0}
                          aria-label={`Planned ${PLATFORM_LABELS[p]} ${COUNTRY_LABELS[c]}`}
                          value={draft ?? cell.planned}
                          onChange={(e) =>
                            setDrafts((d) => ({ ...d, [key]: e.target.value }))
                          }
                          onBlur={(e) => onSavePlanned(p, c, e.target.value)}
                          disabled={isPending}
                          className="h-8 w-28 text-right tabular-nums"
                        />
                        <div className="text-muted-foreground text-xs tabular-nums">
                          actual {formatUsd(cell.actual)}
                        </div>
                        <div
                          className={cn(
                            "text-xs tabular-nums",
                            variance > 0
                              ? "text-destructive"
                              : variance < 0
                                ? "text-success"
                                : "text-muted-foreground",
                          )}
                        >
                          {variance === 0
                            ? "on plan"
                            : `${variance > 0 ? "+" : ""}${formatUsd(variance)}`}
                        </div>
                      </div>
                    </td>
                  );
                })}
                <td className="bg-surface px-3 py-2 text-right">
                  <div className="tabular-nums">
                    {formatUsd(totals.byPlatform[p].planned)}
                  </div>
                  <div className="text-muted-foreground text-xs tabular-nums">
                    actual {formatUsd(totals.byPlatform[p].actual)}
                  </div>
                </td>
              </tr>
            ))}
            <tr className="bg-surface">
              <td className="px-3 py-2 font-normal">Total</td>
              {COUNTRIES.map((c) => (
                <td key={c} className="px-3 py-2 text-right">
                  <div className="tabular-nums">
                    {formatUsd(totals.byCountry[c].planned)}
                  </div>
                  <div className="text-muted-foreground text-xs tabular-nums">
                    actual {formatUsd(totals.byCountry[c].actual)}
                  </div>
                </td>
              ))}
              <td className="px-3 py-2 text-right">
                <div className="text-foreground tabular-nums">
                  {formatUsd(totals.grandPlanned)}
                </div>
                <div className="text-muted-foreground text-xs tabular-nums">
                  actual {formatUsd(totals.grandActual)}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-muted-foreground text-xs">
        Planned cells save on blur. Actuals are summed from <code>weekly_funnel</code> via the{" "}
        <code>monthly_actuals</code> view.
      </p>
    </div>
  );
}
