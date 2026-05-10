"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bulkWeekInputSchema, type BulkWeekInput } from "@/lib/schemas/funnel";
import {
  PLATFORMS,
  COUNTRIES,
  PLATFORM_LABELS,
  COUNTRY_LABELS,
} from "@/lib/schemas/enums";
import { bulkAddWeek } from "@/app/(app)/funnel/actions";
import { toMondayISO } from "@/lib/utils/week";

const todayMonday = toMondayISO(new Date());

function buildEmptyRows(): BulkWeekInput["rows"] {
  return PLATFORMS.flatMap((platform) =>
    COUNTRIES.map((country) => ({
      platform,
      country,
      spend_usd: 0,
      leads: 0,
      sql1: 0,
      sql2: 0,
      sal1: 0,
      sal2: 0,
      client: 0,
    })),
  );
}

export function FunnelBulkWeekForm() {
  const [isPending, startTransition] = useTransition();
  const [resetKey, setResetKey] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BulkWeekInput>({
    resolver: zodResolver(bulkWeekInputSchema),
    defaultValues: {
      week_start: todayMonday,
      rows: buildEmptyRows(),
    },
  });

  const { fields } = useFieldArray({ control, name: "rows" });

  const onSubmit = (values: BulkWeekInput) => {
    startTransition(async () => {
      const result = await bulkAddWeek(values);
      if (result.ok) {
        toast.success("Week saved");
        setResetKey((k) => k + 1);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form
      key={resetKey}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      <div className="max-w-xs space-y-2">
        <Label htmlFor="bulk_week_start">Week (Monday)</Label>
        <Input id="bulk_week_start" type="date" {...register("week_start")} />
        {errors.week_start && (
          <p className="text-destructive text-sm">{errors.week_start.message}</p>
        )}
      </div>

      <div className="border-border overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface text-muted-foreground border-border border-b">
              <th className="px-3 py-2 text-left font-normal">Platform</th>
              <th className="px-3 py-2 text-left font-normal">Country</th>
              <th className="px-3 py-2 text-right font-normal">Spend</th>
              <th className="px-3 py-2 text-right font-normal">Leads</th>
              <th className="px-3 py-2 text-right font-normal">SQL1</th>
              <th className="px-3 py-2 text-right font-normal">SQL2</th>
              <th className="px-3 py-2 text-right font-normal">SAL1</th>
              <th className="px-3 py-2 text-right font-normal">SAL2</th>
              <th className="px-3 py-2 text-right font-normal">Client</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, idx) => (
              <tr key={field.id} className="border-border border-b last:border-0">
                <td className="px-3 py-2">{PLATFORM_LABELS[field.platform]}</td>
                <td className="px-3 py-2">{COUNTRY_LABELS[field.country]}</td>
                {(["spend_usd", "leads", "sql1", "sql2", "sal1", "sal2", "client"] as const).map(
                  (col) => (
                    <td key={col} className="p-1">
                      <Input
                        type="number"
                        inputMode="decimal"
                        step={col === "spend_usd" ? "0.01" : "1"}
                        min={0}
                        aria-label={`${PLATFORM_LABELS[field.platform]} ${COUNTRY_LABELS[field.country]} ${col}`}
                        className="h-8 text-right"
                        {...register(`rows.${idx}.${col}`)}
                      />
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-muted-foreground text-xs">
        Rows where all metrics are zero are skipped. Existing rows for the same week / platform /
        country are overwritten.
      </p>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save week"}
        </Button>
      </div>
    </form>
  );
}
