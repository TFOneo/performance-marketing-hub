import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FunnelEntryForm } from "@/components/forms/funnel-entry-form";
import { FunnelBulkWeekForm } from "@/components/forms/funnel-bulk-week-form";
import { FunnelTable, type FunnelRow } from "@/components/tables/funnel-table";
import { createClient } from "@/lib/supabase/server";
import type { Platform, Country } from "@/lib/schemas/enums";

export default async function FunnelPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weekly_funnel")
    .select(
      "id, week_start, platform, country, spend_usd, leads, sql1, sql2, sal1, sal2, client, notes",
    )
    .order("week_start", { ascending: false })
    .limit(500);

  const rows: FunnelRow[] = (data ?? []).map((r) => ({
    id: r.id,
    week_start: r.week_start,
    platform: r.platform as Platform,
    country: r.country as Country,
    spend_usd: Number(r.spend_usd),
    leads: r.leads,
    sql1: r.sql1,
    sql2: r.sql2,
    sal1: r.sal1,
    sal2: r.sal2,
    client: r.client,
    notes: r.notes,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title="Weekly funnel"
        description="Spend and funnel metrics by platform × country, one row per ISO week."
      />

      <Tabs defaultValue="single" className="space-y-6">
        <TabsList>
          <TabsTrigger value="single">Add one row</TabsTrigger>
          <TabsTrigger value="bulk">Bulk add week</TabsTrigger>
          <TabsTrigger value="all">All entries</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="border-border bg-bg rounded-md border p-6">
          <FunnelEntryForm />
        </TabsContent>

        <TabsContent value="bulk" className="border-border bg-bg rounded-md border p-6">
          <FunnelBulkWeekForm />
        </TabsContent>

        <TabsContent value="all" className="border-border bg-bg rounded-md border p-6">
          {error && (
            <p className="text-destructive text-sm">
              Could not load entries: {error.message}
            </p>
          )}
          <FunnelTable rows={rows} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
