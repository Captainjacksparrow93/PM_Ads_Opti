-- AdsPilot Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- AGENCIES
-- ============================================================
create table agencies (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  logo_url    text,
  website     text,
  currency    text not null default 'USD',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
create table agency_members (
  id          uuid primary key default uuid_generate_v4(),
  agency_id   uuid not null references agencies(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  email       text not null,
  name        text not null,
  role        text not null check (role in ('admin', 'manager', 'viewer')) default 'manager',
  avatar_url  text,
  invited_at  timestamptz not null default now(),
  joined_at   timestamptz,
  unique(agency_id, user_id)
);

-- ============================================================
-- CLIENTS
-- ============================================================
create table clients (
  id               uuid primary key default uuid_generate_v4(),
  agency_id        uuid not null references agencies(id) on delete cascade,
  name             text not null,
  logo_url         text,
  industry         text,
  website          text,
  currency         text not null default 'USD',
  monthly_budget   numeric(12,2),
  meta_connected   boolean not null default false,
  google_connected boolean not null default false,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================
-- AD ACCOUNTS
-- ============================================================
create table ad_accounts (
  id                    uuid primary key default uuid_generate_v4(),
  client_id             uuid not null references clients(id) on delete cascade,
  platform              text not null check (platform in ('meta', 'google')),
  account_id            text not null,
  account_name          text not null,
  currency              text not null default 'USD',
  timezone              text not null default 'UTC',
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at      timestamptz,
  connected_at          timestamptz not null default now(),
  unique(client_id, platform, account_id)
);

-- ============================================================
-- CAMPAIGNS
-- ============================================================
create table campaigns (
  id                    uuid primary key default uuid_generate_v4(),
  client_id             uuid not null references clients(id) on delete cascade,
  ad_account_id         uuid references ad_accounts(id),
  platform              text not null check (platform in ('meta', 'google')),
  platform_campaign_id  text,
  name                  text not null,
  objective             text not null,
  status                text not null check (status in ('active', 'paused', 'draft', 'pending_approval', 'completed', 'error')) default 'draft',
  daily_budget          numeric(12,2) not null default 0,
  total_budget          numeric(12,2),
  currency              text not null default 'USD',
  start_date            date,
  end_date              date,
  -- Target KPIs stored as JSONB
  targets               jsonb not null default '{}',
  -- Latest metrics snapshot
  metrics               jsonb not null default '{}',
  ai_managed            boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ============================================================
-- CAMPAIGN METRICS HISTORY (for trend charts)
-- ============================================================
create table campaign_metrics_history (
  id            uuid primary key default uuid_generate_v4(),
  campaign_id   uuid not null references campaigns(id) on delete cascade,
  date          date not null,
  spend         numeric(12,2) not null default 0,
  impressions   bigint not null default 0,
  clicks        bigint not null default 0,
  conversions   numeric(10,2) not null default 0,
  revenue       numeric(12,2) not null default 0,
  roas          numeric(8,4) not null default 0,
  cpa           numeric(10,2) not null default 0,
  ctr           numeric(6,4) not null default 0,
  cpc           numeric(8,4) not null default 0,
  cpm           numeric(8,4) not null default 0,
  created_at    timestamptz not null default now(),
  unique(campaign_id, date)
);

-- ============================================================
-- ASSETS
-- ============================================================
create table assets (
  id                uuid primary key default uuid_generate_v4(),
  client_id         uuid not null references clients(id) on delete cascade,
  type              text not null check (type in ('image', 'video', 'copy')),
  name              text not null,
  url               text,
  thumbnail_url     text,
  content           text,
  width             int,
  height            int,
  duration          int,
  file_size         bigint,
  mime_type         text,
  storage_path      text,
  tags              text[] not null default '{}',
  ai_generated      boolean not null default false,
  performance_score int check (performance_score between 0 and 100),
  usage_count       int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================================================
-- AI ACTIONS LOG
-- ============================================================
create table ai_actions (
  id                uuid primary key default uuid_generate_v4(),
  client_id         uuid not null references clients(id) on delete cascade,
  campaign_id       uuid references campaigns(id),
  platform          text check (platform in ('meta', 'google')),
  action_type       text not null,
  title             text not null,
  reasoning         text not null,
  details           jsonb not null default '{}',
  predicted_impact  text,
  actual_impact     text,
  approval_status   text not null check (approval_status in ('pending', 'approved', 'rejected')) default 'pending',
  approved_by       uuid references auth.users(id),
  approved_at       timestamptz,
  executed_at       timestamptz,
  execution_error   text,
  created_at        timestamptz not null default now()
);

-- ============================================================
-- API KEYS (agency-level, encrypted)
-- ============================================================
create table api_keys (
  id             uuid primary key default uuid_generate_v4(),
  agency_id      uuid not null references agencies(id) on delete cascade,
  service        text not null check (service in ('anthropic', 'meta', 'google')),
  label          text not null default 'Default',
  key_encrypted  text not null,
  key_preview    text not null,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique(agency_id, service)
);

-- ============================================================
-- OPTIMIZATION JOBS (for background worker tracking)
-- ============================================================
create table optimization_jobs (
  id            uuid primary key default uuid_generate_v4(),
  client_id     uuid not null references clients(id) on delete cascade,
  campaign_id   uuid references campaigns(id),
  status        text not null check (status in ('queued', 'running', 'completed', 'failed')) default 'queued',
  started_at    timestamptz,
  completed_at  timestamptz,
  error         text,
  result        jsonb,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table agencies enable row level security;
alter table agency_members enable row level security;
alter table clients enable row level security;
alter table ad_accounts enable row level security;
alter table campaigns enable row level security;
alter table campaign_metrics_history enable row level security;
alter table assets enable row level security;
alter table ai_actions enable row level security;
alter table api_keys enable row level security;
alter table optimization_jobs enable row level security;

-- Helper function: get agency_id for current user
create or replace function get_my_agency_id()
returns uuid language sql security definer
as $$
  select agency_id from agency_members where user_id = auth.uid() limit 1;
$$;

-- Policies: users can only access their own agency's data
create policy "agency members access own agency" on agencies
  for all using (id = get_my_agency_id());

create policy "agency members access own memberships" on agency_members
  for all using (agency_id = get_my_agency_id());

create policy "agency members access own clients" on clients
  for all using (agency_id = get_my_agency_id());

create policy "agency members access own ad accounts" on ad_accounts
  for all using (client_id in (select id from clients where agency_id = get_my_agency_id()));

create policy "agency members access own campaigns" on campaigns
  for all using (client_id in (select id from clients where agency_id = get_my_agency_id()));

create policy "agency members access own metrics" on campaign_metrics_history
  for all using (campaign_id in (select id from campaigns where client_id in (select id from clients where agency_id = get_my_agency_id())));

create policy "agency members access own assets" on assets
  for all using (client_id in (select id from clients where agency_id = get_my_agency_id()));

create policy "agency members access own ai actions" on ai_actions
  for all using (client_id in (select id from clients where agency_id = get_my_agency_id()));

create policy "agency members access own api keys" on api_keys
  for all using (agency_id = get_my_agency_id());

create policy "agency members access own jobs" on optimization_jobs
  for all using (client_id in (select id from clients where agency_id = get_my_agency_id()));

-- ============================================================
-- INDEXES
-- ============================================================
create index on clients(agency_id);
create index on campaigns(client_id, status);
create index on campaigns(platform_campaign_id);
create index on campaign_metrics_history(campaign_id, date desc);
create index on assets(client_id, type);
create index on ai_actions(client_id, created_at desc);
create index on ai_actions(approval_status) where approval_status = 'pending';
create index on optimization_jobs(client_id, status);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_agencies_updated_at before update on agencies for each row execute function update_updated_at();
create trigger update_clients_updated_at before update on clients for each row execute function update_updated_at();
create trigger update_campaigns_updated_at before update on campaigns for each row execute function update_updated_at();
create trigger update_assets_updated_at before update on assets for each row execute function update_updated_at();
create trigger update_api_keys_updated_at before update on api_keys for each row execute function update_updated_at();
