import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VisitorsTable } from "@/components/tables/visitors-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_VISITORS } from "./mock-data";

export default function VisitorsPage() {
  const rows = MOCK_VISITORS;

  const totalVisitors = rows.length;
  const identifiedCompanies = rows.filter((r) => r.company_name).length;
  const totalPageViews = rows.reduce((s, r) => s + r.pages_viewed, 0);
  const countries = new Set(rows.map((r) => r.country).filter(Boolean)).size;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title="Visitors"
        description="Anonymous session and company-level metadata for tfoco.com traffic. Mocked data — pending Compliance review of the live tracking pipeline."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-xs font-normal uppercase tracking-wide">
              Visitors
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl tabular-nums">{totalVisitors}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-xs font-normal uppercase tracking-wide">
              Identified companies
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl tabular-nums">{identifiedCompanies}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-xs font-normal uppercase tracking-wide">
              Page views
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl tabular-nums">{totalPageViews}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-xs font-normal uppercase tracking-wide">
              Countries
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl tabular-nums">{countries}</CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All visitors</TabsTrigger>
          <TabsTrigger value="identified">Identified companies</TabsTrigger>
          <TabsTrigger value="about">About this data</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="border-border bg-bg rounded-md border p-6">
          <VisitorsTable rows={rows} />
        </TabsContent>

        <TabsContent value="identified" className="border-border bg-bg rounded-md border p-6">
          <VisitorsTable rows={rows.filter((r) => r.company_name)} />
        </TabsContent>

        <TabsContent value="about" className="border-border bg-bg rounded-md border p-6">
          <div className="prose prose-sm max-w-none space-y-3 text-sm">
            <p>
              This tab is a UI scaffold against a mocked schema. No tracking is currently
              deployed on tfoco.com and no data is being collected.
            </p>
            <p className="font-medium">Planned schema (Supabase, table <code>visitor_sessions</code>):</p>
            <ul className="list-disc pl-5">
              <li><code>id, session_id, first_seen, last_seen</code></li>
              <li><code>ip_hash</code> (salted SHA-256, raw IP not stored), <code>country</code>, <code>city</code></li>
              <li>Reverse-IP enrichment: <code>company_name, company_domain, industry, company_size</code></li>
              <li>Session: <code>pages_viewed, landing_page, referrer, utm_*, device, browser</code></li>
            </ul>
            <p className="font-medium">Open items before going live:</p>
            <ul className="list-disc pl-5">
              <li>Pick an IP-enrichment vendor (IPinfo, Clearbit Reveal, RB2B).</li>
              <li>Compliance sign-off; PDPL/GDPR cookie banner and privacy notice update on tfoco.com.</li>
              <li>Edge Function endpoint + tracking snippet on the marketing site.</li>
              <li>Confirm we only collect company-level data, not person-level identity resolution.</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
