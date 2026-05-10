"use client";

import { useTransition } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { funnelEntryInputSchema, type FunnelEntryInput } from "@/lib/schemas/funnel";
import {
  PLATFORMS,
  COUNTRIES,
  PLATFORM_LABELS,
  COUNTRY_LABELS,
  type Platform,
  type Country,
} from "@/lib/schemas/enums";
import { updateFunnelEntry } from "@/app/(app)/funnel/actions";

interface FunnelEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: {
    id: string;
    week_start: string;
    platform: Platform;
    country: Country;
    spend_usd: number;
    leads: number;
    sql1: number;
    sql2: number;
    sal1: number;
    sal2: number;
    client: number;
    notes: string | null;
  };
}

interface NumberFieldProps {
  label: string;
  id: string;
  register: UseFormRegisterReturn;
  step?: string;
}

function NumberField({ label, id, register, step }: NumberFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        step={step ?? "1"}
        min={0}
        {...register}
      />
    </div>
  );
}

export function FunnelEditDialog({ open, onOpenChange, entry }: FunnelEditDialogProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm<FunnelEntryInput>({
    resolver: zodResolver(funnelEntryInputSchema),
    defaultValues: {
      week_start: entry.week_start,
      platform: entry.platform,
      country: entry.country,
      spend_usd: entry.spend_usd,
      leads: entry.leads,
      sql1: entry.sql1,
      sql2: entry.sql2,
      sal1: entry.sal1,
      sal2: entry.sal2,
      client: entry.client,
      notes: entry.notes ?? "",
    },
  });

  const platform = watch("platform");
  const country = watch("country");

  const onSubmit = (values: FunnelEntryInput) => {
    startTransition(async () => {
      const result = await updateFunnelEntry({ ...values, id: entry.id });
      if (result.ok) {
        toast.success("Entry updated");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit funnel entry</DialogTitle>
          <DialogDescription>
            Adjust the metrics for this week / platform / country. The unique key prevents
            duplicates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="edit_week_start">Week</Label>
              <Input id="edit_week_start" type="date" {...register("week_start")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_platform">Platform</Label>
              <Select value={platform} onValueChange={(v) => setValue("platform", v as Platform)}>
                <SelectTrigger id="edit_platform" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PLATFORM_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_country">Country</Label>
              <Select value={country} onValueChange={(v) => setValue("country", v as Country)}>
                <SelectTrigger id="edit_country" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {COUNTRY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-7">
            <NumberField
              label="Spend (USD)"
              id="edit_spend"
              register={register("spend_usd")}
              step="0.01"
            />
            <NumberField label="Leads" id="edit_leads" register={register("leads")} />
            <NumberField label="SQL1" id="edit_sql1" register={register("sql1")} />
            <NumberField label="SQL2" id="edit_sql2" register={register("sql2")} />
            <NumberField label="SAL1" id="edit_sal1" register={register("sal1")} />
            <NumberField label="SAL2" id="edit_sal2" register={register("sal2")} />
            <NumberField label="Client" id="edit_client" register={register("client")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_notes">Notes</Label>
            <Textarea id="edit_notes" rows={2} maxLength={500} {...register("notes")} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
