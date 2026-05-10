"use client";

import { useTransition } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { addFunnelEntry } from "@/app/(app)/funnel/actions";
import { toMondayISO } from "@/lib/utils/week";

const todayMonday = toMondayISO(new Date());

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

export function FunnelEntryForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FunnelEntryInput>({
    resolver: zodResolver(funnelEntryInputSchema),
    defaultValues: {
      week_start: todayMonday,
      platform: "google",
      country: "KSA",
      spend_usd: 0,
      leads: 0,
      sql1: 0,
      sql2: 0,
      sal1: 0,
      sal2: 0,
      client: 0,
      notes: "",
    },
  });

  const platform = watch("platform");
  const country = watch("country");

  const onSubmit = (values: FunnelEntryInput) => {
    startTransition(async () => {
      const result = await addFunnelEntry(values);
      if (result.ok) {
        toast.success("Entry saved");
        reset({
          ...values,
          spend_usd: 0,
          leads: 0,
          sql1: 0,
          sql2: 0,
          sal1: 0,
          sal2: 0,
          client: 0,
          notes: "",
        });
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="week_start">Week (Monday)</Label>
          <Input id="week_start" type="date" {...register("week_start")} />
          {errors.week_start && (
            <p className="text-destructive text-sm">{errors.week_start.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform">Platform</Label>
          <Select value={platform} onValueChange={(v) => setValue("platform", v as Platform)}>
            <SelectTrigger id="platform" className="w-full">
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
          <Label htmlFor="country">Country</Label>
          <Select value={country} onValueChange={(v) => setValue("country", v as Country)}>
            <SelectTrigger id="country" className="w-full">
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
          id="spend_usd"
          register={register("spend_usd")}
          step="0.01"
        />
        <NumberField label="Leads" id="leads" register={register("leads")} />
        <NumberField label="SQL1" id="sql1" register={register("sql1")} />
        <NumberField label="SQL2" id="sql2" register={register("sql2")} />
        <NumberField label="SAL1" id="sal1" register={register("sal1")} />
        <NumberField label="SAL2" id="sal2" register={register("sal2")} />
        <NumberField label="Client" id="client" register={register("client")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" rows={2} maxLength={500} {...register("notes")} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save entry"}
        </Button>
      </div>
    </form>
  );
}
