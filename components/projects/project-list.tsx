"use client";

import Link from "next/link";
import { format, parseISO, isAfter } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/schemas/enums";
import { cn } from "@/lib/utils";

export interface ProjectListRow {
  id: string;
  title: string;
  owner: string | null;
  status: ProjectStatus;
  progress_pct: number;
  due_date: string | null;
  linked_campaign_ids: string[];
}

export function ProjectList({ rows }: { rows: ProjectListRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="border-border bg-bg rounded-md border p-8 text-center">
        <p className="text-muted-foreground text-sm">
          No projects yet. Click <strong>New project</strong> to add one.
        </p>
      </div>
    );
  }

  return (
    <div className="border-border overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Due</TableHead>
            <TableHead className="text-right">Campaigns</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const overdue =
              row.due_date && isAfter(new Date(), parseISO(row.due_date));
            return (
              <TableRow key={row.id} className="hover:bg-surface">
                <TableCell>
                  <Link
                    href={`/projects/${row.id}`}
                    className="text-foreground hover:text-brand-gold underline-offset-4 hover:underline"
                  >
                    {row.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{row.owner ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{PROJECT_STATUS_LABELS[row.status]}</Badge>
                </TableCell>
                <TableCell className="tabular-nums">{row.progress_pct}%</TableCell>
                <TableCell
                  className={cn(
                    "text-muted-foreground text-sm",
                    overdue && "text-destructive",
                  )}
                >
                  {row.due_date ? format(parseISO(row.due_date), "d MMM yyyy") : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.linked_campaign_ids.length}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
