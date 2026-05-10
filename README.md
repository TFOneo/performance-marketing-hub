# TFO Performance Marketing Hub

Private, single-user internal dashboard for performance marketing operations at The Family Office. Tracks weekly funnel data, campaigns, marketing projects, and budgets across three platforms × four GCC countries — with on-demand Anthropic-backed campaign ratings and budget reallocation suggestions.

This is a draft tool for internal use, not a regulated client deliverable. All AI calls are server-side; no client data flows through it.

## Stack

- Next.js 16 (App Router, RSC) · TypeScript strict
- Supabase (Postgres + Auth) via `@supabase/ssr`
- Anthropic SDK with model `claude-sonnet-4-6`
- Tailwind CSS v4 + shadcn/ui (Base UI primitives)
- Recharts · React Hook Form + Zod · TanStack Table · date-fns
- Hosted on Vercel (region `fra1`); deploys from `main`

## Setup

```bash
# Install pnpm via Node 22's bundled corepack
corepack enable && corepack prepare pnpm@latest --activate

pnpm install

cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#         SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, ALLOWED_EMAIL

pnpm exec supabase login
pnpm exec supabase link --project-ref <project-ref>
pnpm db:push        # applies supabase/migrations/0001_init.sql
pnpm db:types       # regenerates lib/supabase/database.types.ts

pnpm dev            # http://localhost:3000
```

## Scripts

- `pnpm dev` — local dev server (Turbopack)
- `pnpm build` — production build
- `pnpm start` — production server
- `pnpm lint` — ESLint
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm format` — Prettier write
- `pnpm db:push` — apply migrations to linked Supabase project
- `pnpm db:types` — regenerate Supabase types
- `pnpm db:reset` — reset linked DB (destructive — be careful)

## Auth

Magic-link only via Supabase. The single allowed login email is set via the `ALLOWED_EMAIL` env var and enforced in three places:
1. The `/login` server action rejects the request before calling Supabase.
2. The `/auth/callback` route re-checks after code exchange and signs out on mismatch.
3. The middleware enforces it on every `(app)` route as defense-in-depth.

Configure the Supabase Auth dashboard with redirect URLs for both `http://localhost:3000/auth/callback` and the production Vercel domain. Avoid wildcard previews; restrict auth-required testing to production deploys.

## Design decisions

- **Develop against cloud Supabase** (no Docker / local stack) — single dev, simpler ops.
- **Single `0001_init.sql` migration for v1**; future feature changes get `0002_*.sql`, etc.
- **Vercel region `fra1`** (Frankfurt — closest to GCC).
- **Anthropic model pinned in code** as a constant, not env-driven, so model upgrades are deliberate PRs.
- **RLS via simple `user_id = auth.uid()`** per the brief; no GUC indirection.
- **`temperature: 0`** for both AI prompts — score stability across re-runs is a product requirement.
- **Apply reallocation via Postgres function** for atomicity (`SELECT ... FOR UPDATE` + status guard).
- **No tests for v1**; manual milestone verification per brief.
- **Inter (not Gotham)** for typography — Gotham Light is desktop-licensed only and cannot be embedded.

## Build log

### M1 — Bootstrap

Scaffolded Next.js 16 + Tailwind v4 via `create-next-app`. Installed core deps: Supabase SSR/JS, Anthropic SDK, RHF + Zod, TanStack Table, Recharts, date-fns, shadcn primitives (Base UI), sonner, MD editor. Wired TFO design tokens into `globals.css` mapped onto shadcn semantic tokens. Set up Prettier, env-var Zod loader, vercel.json (region `fra1`).

### M2 — Supabase + auth

Wrote `supabase/migrations/0001_init.sql` — full schema (5 enums, 6 tables, `monthly_actuals` view, `apply_reallocation` PG function, RLS policies, `updated_at` triggers, indexes). Created hand-written `lib/supabase/database.types.ts` placeholder (regenerate via `pnpm db:types` after linking).

Built three Supabase clients (`@supabase/ssr`): browser, server (with awaited `cookies()` per Next 16), and middleware/proxy session-refresh helper. Added admin (service-role) client guarded by `import "server-only"`.

Implemented magic-link auth: `/login` page + RHF form + server action that pre-validates `ALLOWED_EMAIL` before calling `signInWithOtp`. `/auth/callback` route re-checks email after code exchange and signs out on mismatch. `/auth/auth-code-error` page for friendly failure UX. `(app)` route group has an auth-guarded layout (`force-dynamic`) and a stub overview at `/`.

**Note:** Next.js 16 renamed `middleware.ts` → `proxy.ts` (function exported as `proxy`). All session-refresh logic lives in `proxy.ts` calling `lib/supabase/middleware.ts:updateSession()`.

### M3 — Layout shell + design tokens

Built fixed 240px left sidebar (`components/layout/sidebar.tsx`) with active-route-aware nav and lucide icons. Built sticky top header with `UserMenu` dropdown (Base UI dropdown-menu); sign-out via `useTransition` + server action. `PageHeader` component for consistent title/description/actions slot per route.

`(app)` layout composes the shell, gates auth (`force-dynamic`), and passes the user email to the header. Stub pages exist for `/funnel`, `/campaigns`, `/projects`, `/budget`. Loading and error boundaries (`loading.tsx`, `error.tsx`, `not-found.tsx`) wired at the route-group level.

A11y: every input has `<Label htmlFor>`, `aria-current="page"` on active nav link, focus rings preserved on user-menu trigger, `aria-busy` on loading skeletons, `role="alert"` on form errors.

### M4 — Weekly funnel

`lib/utils/week.ts` for ISO Monday helpers. `lib/schemas/{enums,funnel}.ts` for shared Zod enums and funnel-input schemas (with coercion of stringified numbers from inputs).

Server actions (`app/(app)/funnel/actions.ts`): `addFunnelEntry`, `updateFunnelEntry`, `deleteFunnelEntry`, `bulkAddWeek`. Each scopes by `auth.uid()`, snaps `week_start` to ISO Monday, and surfaces the unique-key violation (`23505`) as a friendly toast. `bulkAddWeek` skips fully-zero rows and `upsert`s by the unique tuple to allow re-saves.

UI: `/funnel` uses Tabs — "Add one row" (single-row form), "Bulk add week" (12-row grid, 3 platforms × 4 countries), "All entries" (TanStack Table with platform/country/week-prefix filters, sortable, edit dialog, delete confirm). All lists are RSC-fetched, mutations revalidate `/funnel` and `/`.
