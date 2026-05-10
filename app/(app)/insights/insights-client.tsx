"use client";

import { useState, useTransition } from "react";
import { ArrowUpIcon, ArrowDownIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { briefMeOnThisWeek } from "./actions";
import type { BriefResponse } from "@/lib/anthropic/schemas";

export function InsightsClient() {
  const [isPending, startTransition] = useTransition();
  const [brief, setBrief] = useState<BriefResponse | null>(null);

  const onClick = () => {
    startTransition(async () => {
      const result = await briefMeOnThisWeek();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setBrief(result.brief);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button type="button" onClick={onClick} disabled={isPending}>
          {isPending ? "Briefing..." : "Brief me on this week"}
        </Button>
        <p className="text-muted-foreground text-xs">
          Compares the last 4 weeks against the prior 4. Uses recent campaign ratings as colour.
        </p>
      </div>

      {brief && (
        <article className="space-y-4">
          <div className="border-border bg-bg rounded-md border p-5">
            <h2 className="text-foreground text-base font-normal">{brief.headline}</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Section
              title="Improved"
              icon={<ArrowUpIcon className="text-success size-4" />}
              items={brief.improved}
              empty="Nothing notable improved."
            />
            <Section
              title="Worsened"
              icon={<ArrowDownIcon className="text-destructive size-4" />}
              items={brief.worsened}
              empty="Nothing notable worsened."
            />
            <Section
              title="Investigate"
              icon={<SearchIcon className="text-brand-gold size-4" />}
              items={brief.investigate}
              empty="No follow-ups suggested."
            />
          </div>
        </article>
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  items,
  empty,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  empty: string;
}) {
  return (
    <div className="border-border bg-bg rounded-md border p-5">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-foreground text-sm">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="text-foreground text-sm leading-snug">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
