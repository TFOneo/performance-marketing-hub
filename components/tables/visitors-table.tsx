"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export interface VisitorRow {
  id: string;
  first_seen: string;
  last_seen: string;
  ip_hash: string;
  country: string | null;
  city: string | null;
  company_name: string | null;
  company_domain: string | null;
  industry: string | null;
  company_size: string | null;
  pages_viewed: number;
  landing_page: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  device: string | null;
  browser: string | null;
}

const fmtDate = (s: string) =>
  new Date(s).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export function VisitorsTable({ rows }: { rows: VisitorRow[] }) {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (country && r.country !== country) return false;
      if (!needle) return true;
      return [r.company_name, r.company_domain, r.industry, r.city, r.landing_page]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(needle));
    });
  }, [rows, q, country]);

  const countries = useMemo(
    () => Array.from(new Set(rows.map((r) => r.country).filter(Boolean))).sort() as string[],
    [rows],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            placeholder="Company, domain, page…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="country">Country</Label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="border-border bg-bg h-9 rounded-md border px-2 text-sm"
          >
            <option value="">All</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="text-muted-foreground ml-auto text-xs">
          {filtered.length} of {rows.length} visitors
        </div>
      </div>

      <div className="border-border overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Landing page</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Pages</TableHead>
              <TableHead>Last seen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-8 text-center text-sm">
                  No visitors match the current filter.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{r.company_name ?? "Unknown"}</span>
                      {r.company_domain && (
                        <a
                          href={`https://${r.company_domain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground text-xs hover:underline"
                        >
                          {r.company_domain}
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.industry ? <Badge variant="outline">{r.industry}</Badge> : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {[r.city, r.country].filter(Boolean).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-sm" title={r.landing_page ?? ""}>
                    {r.landing_page ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.utm_source ?? r.referrer ?? "Direct"}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">{r.pages_viewed}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {fmtDate(r.last_seen)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
