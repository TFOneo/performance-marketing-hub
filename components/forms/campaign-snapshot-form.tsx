"use client";

import { useTransition } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { snapshotInputSchema, type SnapshotInput } from "@/lib/schemas/campaign";
import { addSnapshot } from "@/app/(app)/campaigns/actions";
import { toMondayISO } from "@/lib/utils/week";

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
      <Input id={id} type="number" inputMode="decimal" step={step ?? "1"} min={0} {...register} />
    </div>
  );
}

const todayISO = new Date().toISOString().slice(0, 10);
const lastMondayISO = toMondayISO(new Date());

export function CampaignSnapshotForm({ campaignId }: { campaignId: string }) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SnapshotInput>({
    resolver: zodResolver(snapshotInputSchema),
    defaultValues: {
      campaign_id: campaignId,
      period_start: lastMondayISO,
      period_end: todayISO,
      spend_usd: 0,
      leads: 0,
      sql1: 0,
      sql2: 0,
      sal1: 0,
      sal2: 0,
      client: 0,
    },
  });

  const onSubmit = (values: SnapshotInput) => {
    startTransition(async () => {
      const result = await addSnapshot(values);
      if (result.ok) {
        toast.success(
          result.data.rated ? "Snapshot saved and rated" : "Snapshot saved",
        );
        reset({
          ...values,
          spend_usd: 0,
          leads: 0,
          sql1: 0,
          sql2: 0,
          sal1: 0,
          sal2: 0,
          client: 0,
        });
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <input type="hidden" {...register("campaign_id")} value={campaignId} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="period_start">Period start</Label>
          <Input id="period_start" type="date" {...register("period_start")} />
          {errors.period_start && (
            <p className="text-destructive text-sm">{errors.period_start.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="period_end">Period end</Label>
          <Input id="period_end" type="date" {...register("period_end")} />
          {errors.period_end && (
            <p className="text-destructive text-sm">{errors.period_end.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <NumberField
          label="Spend (USD)"
          id="snap_spend"
          register={register("spend_usd")}
          step="0.01"
        />
        <NumberField label="Leads" id="snap_leads" register={register("leads")} />
        <NumberField label="SQL1" id="snap_sql1" register={register("sql1")} />
        <NumberField label="SQL2" id="snap_sql2" register={register("sql2")} />
        <NumberField label="SAL1" id="snap_sal1" register={register("sal1")} />
        <NumberField label="SAL2" id="snap_sal2" register={register("sal2")} />
        <NumberField label="Client" id="snap_client" register={register("client")} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save snapshot"}
        </Button>
      </div>
    </form>
  );
}
