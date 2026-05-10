-- TFO Performance Marketing Hub — initial schema
-- Single-user app; RLS keyed on auth.uid() for future multi-user safety.

-- ============================================================================
-- Enums
-- ============================================================================

create type platform_t as enum ('google', 'meta', 'linkedin');
create type country_t as enum ('KSA', 'UAE', 'Kuwait', 'Bahrain');
create type campaign_status_t as enum ('active', 'paused', 'ended');
create type project_status_t as enum ('not_started', 'in_progress', 'blocked', 'done');
create type suggestion_status_t as enum ('pending', 'applied', 'dismissed');

-- ============================================================================
-- Helper: updated_at trigger
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- weekly_funnel — overall by platform × country, one row per week
-- ============================================================================

create table public.weekly_funnel (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  platform platform_t not null,
  country country_t not null,
  spend_usd numeric(12, 2) not null default 0,
  leads int not null default 0,
  sql1 int not null default 0,
  sql2 int not null default 0,
  sal1 int not null default 0,
  sal2 int not null default 0,
  client int not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start, platform, country)
);

create index weekly_funnel_user_week_idx
  on public.weekly_funnel (user_id, week_start desc);

create trigger weekly_funnel_set_updated_at
  before update on public.weekly_funnel
  for each row
  execute function public.set_updated_at();

alter table public.weekly_funnel enable row level security;

create policy "weekly_funnel_select_own" on public.weekly_funnel
  for select to authenticated using (user_id = auth.uid());
create policy "weekly_funnel_insert_own" on public.weekly_funnel
  for insert to authenticated with check (user_id = auth.uid());
create policy "weekly_funnel_update_own" on public.weekly_funnel
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "weekly_funnel_delete_own" on public.weekly_funnel
  for delete to authenticated using (user_id = auth.uid());

-- ============================================================================
-- campaigns
-- ============================================================================

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  platform platform_t not null,
  country country_t not null,
  status campaign_status_t not null default 'active',
  start_date date,
  end_date date,
  total_budget_usd numeric(12, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index campaigns_user_idx on public.campaigns (user_id, created_at desc);

create trigger campaigns_set_updated_at
  before update on public.campaigns
  for each row
  execute function public.set_updated_at();

alter table public.campaigns enable row level security;

create policy "campaigns_select_own" on public.campaigns
  for select to authenticated using (user_id = auth.uid());
create policy "campaigns_insert_own" on public.campaigns
  for insert to authenticated with check (user_id = auth.uid());
create policy "campaigns_update_own" on public.campaigns
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "campaigns_delete_own" on public.campaigns
  for delete to authenticated using (user_id = auth.uid());

-- ============================================================================
-- campaign_funnel_entries — each upload becomes a row, AI rates it
-- ============================================================================

create table public.campaign_funnel_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  spend_usd numeric(12, 2) not null default 0,
  leads int not null default 0,
  sql1 int not null default 0,
  sql2 int not null default 0,
  sal1 int not null default 0,
  sal2 int not null default 0,
  client int not null default 0,
  ai_rating_score int check (ai_rating_score is null or (ai_rating_score between 0 and 100)),
  ai_rating_band text,
  ai_rating_rationale text,
  ai_recommendations jsonb,
  ai_rated_at timestamptz,
  created_at timestamptz not null default now()
);

create index campaign_funnel_entries_user_campaign_idx
  on public.campaign_funnel_entries (user_id, campaign_id, period_end desc);

alter table public.campaign_funnel_entries enable row level security;

create policy "cfe_select_own" on public.campaign_funnel_entries
  for select to authenticated using (user_id = auth.uid());
create policy "cfe_insert_own" on public.campaign_funnel_entries
  for insert to authenticated with check (user_id = auth.uid());
create policy "cfe_update_own" on public.campaign_funnel_entries
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "cfe_delete_own" on public.campaign_funnel_entries
  for delete to authenticated using (user_id = auth.uid());

-- ============================================================================
-- projects
-- ============================================================================

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  owner text,
  status project_status_t not null default 'not_started',
  progress_pct int not null default 0 check (progress_pct between 0 and 100),
  due_date date,
  notes_markdown text,
  linked_campaign_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_user_status_idx on public.projects (user_id, status);

create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

alter table public.projects enable row level security;

create policy "projects_select_own" on public.projects
  for select to authenticated using (user_id = auth.uid());
create policy "projects_insert_own" on public.projects
  for insert to authenticated with check (user_id = auth.uid());
create policy "projects_update_own" on public.projects
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "projects_delete_own" on public.projects
  for delete to authenticated using (user_id = auth.uid());

-- ============================================================================
-- budgets — planned monthly per platform × country
-- ============================================================================

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,
  platform platform_t not null,
  country country_t not null,
  planned_usd numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month, platform, country)
);

create index budgets_user_month_idx on public.budgets (user_id, month);

create trigger budgets_set_updated_at
  before update on public.budgets
  for each row
  execute function public.set_updated_at();

alter table public.budgets enable row level security;

create policy "budgets_select_own" on public.budgets
  for select to authenticated using (user_id = auth.uid());
create policy "budgets_insert_own" on public.budgets
  for insert to authenticated with check (user_id = auth.uid());
create policy "budgets_update_own" on public.budgets
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "budgets_delete_own" on public.budgets
  for delete to authenticated using (user_id = auth.uid());

-- ============================================================================
-- reallocation_runs — one row per AI generation
-- ============================================================================

create table public.reallocation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generated_at timestamptz not null default now(),
  lookback_weeks int not null default 4,
  payload jsonb not null,
  status suggestion_status_t not null default 'pending',
  applied_move_index int,
  applied_at timestamptz,
  created_at timestamptz not null default now()
);

create index reallocation_runs_user_idx
  on public.reallocation_runs (user_id, generated_at desc);

alter table public.reallocation_runs enable row level security;

create policy "rr_select_own" on public.reallocation_runs
  for select to authenticated using (user_id = auth.uid());
create policy "rr_insert_own" on public.reallocation_runs
  for insert to authenticated with check (user_id = auth.uid());
create policy "rr_update_own" on public.reallocation_runs
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "rr_delete_own" on public.reallocation_runs
  for delete to authenticated using (user_id = auth.uid());

-- ============================================================================
-- monthly_actuals view
-- Single source of truth for actual spend per platform × country per month.
-- ============================================================================

create or replace view public.monthly_actuals
with (security_invoker = on) as
select
  user_id,
  date_trunc('month', week_start)::date as month,
  platform,
  country,
  sum(spend_usd) as actual_usd,
  sum(leads) as leads,
  sum(sal1) as sal1,
  case when sum(sal1) > 0 then sum(spend_usd) / sum(sal1) else null end as cost_per_sal1
from public.weekly_funnel
group by 1, 2, 3, 4;

-- ============================================================================
-- apply_reallocation — atomically applies one move from a reallocation run
-- ============================================================================

create or replace function public.apply_reallocation(
  p_run_id uuid,
  p_move_index int
)
returns void
language plpgsql
security invoker
as $$
declare
  v_run public.reallocation_runs%rowtype;
  v_move jsonb;
  v_user uuid := auth.uid();
  v_month date := date_trunc('month', current_date)::date;
  v_shift numeric;
  v_from_platform platform_t;
  v_from_country country_t;
  v_to_platform platform_t;
  v_to_country country_t;
begin
  if v_user is null then
    raise exception 'apply_reallocation: not authenticated';
  end if;

  -- Acquire row lock; second concurrent caller will see status != 'pending' below.
  select * into v_run
  from public.reallocation_runs
  where id = p_run_id and user_id = v_user
  for update;

  if v_run is null then
    raise exception 'apply_reallocation: run % not found', p_run_id;
  end if;

  if v_run.status <> 'pending' then
    raise exception 'apply_reallocation: run % status is %, expected pending', p_run_id, v_run.status;
  end if;

  v_move := (v_run.payload -> 'moves') -> p_move_index;
  if v_move is null then
    raise exception 'apply_reallocation: move index % out of range', p_move_index;
  end if;

  v_shift := (v_move ->> 'shift_usd')::numeric;
  if v_shift is null or v_shift <= 0 then
    raise exception 'apply_reallocation: invalid shift_usd %', v_shift;
  end if;

  v_from_platform := (v_move #>> '{from,platform}')::platform_t;
  v_from_country := (v_move #>> '{from,country}')::country_t;
  v_to_platform := (v_move #>> '{to,platform}')::platform_t;
  v_to_country := (v_move #>> '{to,country}')::country_t;

  -- Decrement source
  insert into public.budgets (user_id, month, platform, country, planned_usd)
  values (v_user, v_month, v_from_platform, v_from_country, 0)
  on conflict (user_id, month, platform, country) do nothing;

  update public.budgets
  set planned_usd = planned_usd - v_shift,
      updated_at = now()
  where user_id = v_user
    and month = v_month
    and platform = v_from_platform
    and country = v_from_country;

  -- Increment destination
  insert into public.budgets (user_id, month, platform, country, planned_usd)
  values (v_user, v_month, v_to_platform, v_to_country, v_shift)
  on conflict (user_id, month, platform, country)
  do update set planned_usd = public.budgets.planned_usd + v_shift,
                updated_at = now();

  update public.reallocation_runs
  set status = 'applied',
      applied_move_index = p_move_index,
      applied_at = now()
  where id = p_run_id;
end;
$$;

grant execute on function public.apply_reallocation(uuid, int) to authenticated;
