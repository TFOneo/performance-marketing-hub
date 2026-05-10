"use client";

import { useMemo, useState, useTransition } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { MoreHorizontalIcon } from "lucide-react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PLATFORMS,
  COUNTRIES,
  PLATFORM_LABELS,
  COUNTRY_LABELS,
  type Platform,
  type Country,
} from "@/lib/schemas/enums";
import { FunnelEditDialog } from "@/components/forms/funnel-edit-dialog";
import { deleteFunnelEntry } from "@/app/(app)/funnel/actions";
import { formatWeekLabel } from "@/lib/utils/week";

export interface FunnelRow {
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
}

const formatUsd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

export function FunnelTable({ rows }: { rows: FunnelRow[] }) {
  const [editing, setEditing] = useState<FunnelRow | null>(null);
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [countryFilter, setCountryFilter] = useState<Country | "all">("all");
  const [weekFilter, setWeekFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "week_start", desc: true }]);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (platformFilter !== "all" && r.platform !== platformFilter) return false;
      if (countryFilter !== "all" && r.country !== countryFilter) return false;
      if (weekFilter && !r.week_start.startsWith(weekFilter)) return false;
      return true;
    });
  }, [rows, platformFilter, countryFilter, weekFilter]);

  const onDelete = (id: string) => {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteFunnelEntry(id);
      if (result.ok) toast.success("Entry deleted");
      else toast.error(result.error);
    });
  };

  const columns = useMemo<ColumnDef<FunnelRow>[]>(
    () => [
      {
        accessorKey: "week_start",
        header: "Week",
        cell: ({ getValue }) => formatWeekLabel(getValue<string>()),
      },
      {
        accessorKey: "platform",
        header: "Platform",
        cell: ({ getValue }) => PLATFORM_LABELS[getValue<Platform>()],
      },
      {
        accessorKey: "country",
        header: "Country",
        cell: ({ getValue }) => COUNTRY_LABELS[getValue<Country>()],
      },
      {
        accessorKey: "spend_usd",
        header: () => <div className="text-right">Spend</div>,
        cell: ({ getValue }) => (
          <div className="text-right tabular-nums">{formatUsd(getValue<number>())}</div>
        ),
      },
      {
        accessorKey: "leads",
        header: () => <div className="text-right">Leads</div>,
        cell: ({ getValue }) => (
          <div className="text-right tabular-nums">{getValue<number>()}</div>
        ),
      },
      {
        accessorKey: "sql1",
        header: () => <div className="text-right">SQL1</div>,
        cell: ({ getValue }) => (
          <div className="text-right tabular-nums">{getValue<number>()}</div>
        ),
      },
      {
        accessorKey: "sal1",
        header: () => <div className="text-right">SAL1</div>,
        cell: ({ getValue }) => (
          <div className="text-right tabular-nums">{getValue<number>()}</div>
        ),
      },
      {
        accessorKey: "client",
        header: () => <div className="text-right">Client</div>,
        cell: ({ getValue }) => (
          <div className="text-right tabular-nums">{getValue<number>()}</div>
        ),
      },
      {
        id: "cost_per_sal1",
        header: () => <div className="text-right">$/SAL1</div>,
        cell: ({ row }) => {
          const sal1 = row.original.sal1;
          const cost = sal1 > 0 ? row.original.spend_usd / sal1 : null;
          return (
            <div className="text-right tabular-nums">
              {cost === null ? "—" : formatUsd(cost)}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="hover:bg-surface focus-visible:ring-ring inline-flex size-8 items-center justify-center rounded-md outline-none focus-visible:ring-2"
                aria-label="Row actions"
              >
                <MoreHorizontalIcon className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditing(row.original)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(row.original.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="filter_platform" className="text-xs">
            Platform
          </Label>
          <Select
            value={platformFilter}
            onValueChange={(v) => setPlatformFilter(v as Platform | "all")}
          >
            <SelectTrigger id="filter_platform" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>
                  {PLATFORM_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter_country" className="text-xs">
            Country
          </Label>
          <Select
            value={countryFilter}
            onValueChange={(v) => setCountryFilter(v as Country | "all")}
          >
            <SelectTrigger id="filter_country" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {COUNTRY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter_week" className="text-xs">
            Week prefix (YYYY or YYYY-MM)
          </Label>
          <Input
            id="filter_week"
            value={weekFilter}
            onChange={(e) => setWeekFilter(e.target.value)}
            placeholder="2026-05"
            className="w-40"
          />
        </div>
        {(platformFilter !== "all" || countryFilter !== "all" || weekFilter) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setPlatformFilter("all");
              setCountryFilter("all");
              setWeekFilter("");
            }}
          >
            Clear filters
          </Button>
        )}
        <div className="text-muted-foreground ml-auto text-xs">
          {filtered.length} {filtered.length === 1 ? "row" : "rows"}
        </div>
      </div>

      <div className="border-border overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className={
                      h.column.getCanSort() ? "cursor-pointer select-none" : undefined
                    }
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === "asc" && " ↑"}
                    {h.column.getIsSorted() === "desc" && " ↓"}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-muted-foreground py-8 text-center">
                  No entries match the filters.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <FunnelEditDialog
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          entry={editing}
        />
      )}
    </div>
  );
}
