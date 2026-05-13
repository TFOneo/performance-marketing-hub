"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  TableIcon,
  MegaphoneIcon,
  KanbanIcon,
  WalletIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match: (pathname: string) => boolean;
}

const NAV: NavItem[] = [
  {
    href: "/",
    label: "Overview",
    icon: LayoutDashboardIcon,
    match: (p) => p === "/",
  },
  {
    href: "/funnel",
    label: "Funnel",
    icon: TableIcon,
    match: (p) => p === "/funnel" || p.startsWith("/funnel/"),
  },
  {
    href: "/campaigns",
    label: "Campaigns",
    icon: MegaphoneIcon,
    match: (p) => p === "/campaigns" || p.startsWith("/campaigns/"),
  },
  {
    href: "/projects",
    label: "Projects",
    icon: KanbanIcon,
    match: (p) => p === "/projects" || p.startsWith("/projects/"),
  },
  {
    href: "/budget",
    label: "Budget",
    icon: WalletIcon,
    match: (p) => p === "/budget" || p.startsWith("/budget/"),
  },
  {
    href: "/visitors",
    label: "Visitors",
    icon: UsersIcon,
    match: (p) => p === "/visitors" || p.startsWith("/visitors/"),
  },
  {
    href: "/insights",
    label: "Insights",
    icon: SparklesIcon,
    match: (p) => p === "/insights",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="bg-bg border-border fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r md:flex"
    >
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-brand-black text-base font-light tracking-tight">TFO</span>
          <span className="text-brand-gold text-xs font-normal tracking-wide uppercase">
            Performance Marketing
          </span>
        </Link>
      </div>
      <ul className="flex flex-1 flex-col gap-1 px-3 py-2">
        {NAV.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-surface text-brand-black font-normal"
                    : "text-muted-foreground hover:bg-surface hover:text-brand-black",
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="text-muted-foreground border-border border-t px-6 py-4 text-xs">
        Internal use only
      </div>
    </nav>
  );
}
