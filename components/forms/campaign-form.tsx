"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { campaignInputSchema, type CampaignInput } from "@/lib/schemas/campaign";
import {
  PLATFORMS,
  COUNTRIES,
  PLATFORM_LABELS,
  COUNTRY_LABELS,
  type Platform,
  type Country,
} from "@/lib/schemas/enums";
import { createCampaign } from "@/app/(app)/campaigns/actions";

export function NewCampaignDialog() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CampaignInput>({
    resolver: zodResolver(campaignInputSchema),
    defaultValues: {
      name: "",
      platform: "google",
      country: "KSA",
      status: "active",
      start_date: null,
      end_date: null,
      total_budget_usd: null,
      notes: "",
    },
  });

  const platform = watch("platform");
  const country = watch("country");

  const onSubmit = (values: CampaignInput) => {
    startTransition(async () => {
      const result = await createCampaign(values);
      if (result.ok) {
        toast.success("Campaign created");
        reset();
        router.push(`/campaigns/${result.data.id}`);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button>New campaign</Button>} />
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New campaign</DialogTitle>
          <DialogDescription>
            Register a campaign so you can upload funnel snapshots and get an AI rating.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="campaign_name">Name</Label>
            <Input id="campaign_name" {...register("name")} />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="campaign_platform">Platform</Label>
              <Select
                value={platform}
                onValueChange={(v) => setValue("platform", v as Platform)}
              >
                <SelectTrigger id="campaign_platform" className="w-full">
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
              <Label htmlFor="campaign_country">Country</Label>
              <Select
                value={country}
                onValueChange={(v) => setValue("country", v as Country)}
              >
                <SelectTrigger id="campaign_country" className="w-full">
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

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="campaign_start">Start (optional)</Label>
              <Input id="campaign_start" type="date" {...register("start_date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign_end">End (optional)</Label>
              <Input id="campaign_end" type="date" {...register("end_date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign_budget">Total budget USD (optional)</Label>
              <Input
                id="campaign_budget"
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                {...register("total_budget_usd")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign_notes">Notes (optional)</Label>
            <Textarea id="campaign_notes" rows={2} maxLength={2000} {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
