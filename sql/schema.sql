-- ============================================================
-- schema.sql  --  the project's database schema (tables, triggers,
-- functions, RLS policies, seed companies).
-- Run this once on a new Supabase project, BEFORE ALL_IN_ONE.sql.
-- ============================================================
--
-- TABLES EK DOOSRE SE KAISE JUDE HAIN (relationship map)
-- ------------------------------------------------------------
-- accounts = center table. Har user (job seeker / recruiter / admin)
-- ki ek row. Baaki sab tables isi ke `id` ko foreign key (FK) se
-- point karti hain.
--
--   accounts.id ──1:1──> profiles.account_id        (extra info: bio, skills)
--   accounts.id ──1:1──> user_settings.account_id   (dashboard toggles)
--   accounts.id ──1:N──> sessions.account_id        (login sessions)
--   accounts.id ──1:N──> companies.owner_id         (company kisne banai)
--   accounts.id ──1:N──> jobs.recruiter_id          (recruiter ki jobs)
--   companies.id ──1:N──> jobs.company_id           (company ki jobs)
--   jobs.id     ──1:N──> applications.job_id        (job pe aayi applications)
--   accounts.id ──1:N──> applications.applicant_id  (seeker ki applications)
--   accounts.id ──1:N──> saved_jobs.account_id      (bookmarks)
--   jobs.id     ──1:N──> saved_jobs.job_id
--
-- M:N relationships (beech mein ek table, 2 FKs ke saath):
--   job seekers <──> jobs  via  applications  (apply kiya)
--   users       <──> jobs  via  saved_jobs    (save kiya)
--
-- ON DELETE:
--   cascade  = parent delete -> child rows bhi delete (account delete
--              karo to uski profile, sessions, jobs, applications sab gaye)
--   set null = parent delete -> child ka FK NULL (company delete ho to
--              job rehti hai, bas company_id NULL)
--
-- App kaise use karta hai: browser -> Next.js API route (src/app/api)
-- -> src/lib/supabase.js (service role key) -> ye tables.
-- Column names snake_case hain (job_title); frontend camelCase use
-- karta hai (jobTitle). Conversion src/lib/mappers.js mein hoti hai.
-- Poori field-by-field list: DATABASE_GUIDE.md
-- ============================================================

-- >>>>>>>>>>>>>>>>>>>>  00_extensions.sql  <<<<<<<<<<<<<<<<<<<<

-- ============================================================
-- 00_extensions.sql
-- Shared setup: extensions + helper functions
-- Run this FIRST, before every other file.
-- ============================================================

-- gen_random_uuid() ke liye
create extension if not exists "pgcrypto";

-- Text search / trigram (job search me ilike fast karne ke liye)
create extension if not exists "pg_trgm";

-- ------------------------------------------------------------
-- Har table ka updated_at automatically set karne wala trigger
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- >>>>>>>>>>>>>>>>>>>>  01_accounts.sql  <<<<<<<<<<<<<<<<<<<<

-- ============================================================
-- 01_accounts.sql  --  ACCOUNT PART
-- User account table (email + password based, koi Clerk nahi)
-- Depends on: 00_extensions.sql
-- ============================================================

create table if not exists public.accounts (
  id             uuid primary key default gen_random_uuid(),
  email          text        not null,
  password_hash  text        not null,
  full_name      text        not null,
  role           text        not null default 'job_seeker',
  email_verified boolean     not null default false,
  is_active      boolean     not null default true,
  last_login_at  timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint accounts_email_lowercase check (email = lower(email)),
  constraint accounts_role_valid check (role in ('job_seeker', 'recruiter', 'admin'))
);

-- Email case-insensitive unique
create unique index if not exists accounts_email_key on public.accounts (email);
create index if not exists accounts_role_idx           on public.accounts (role);
create index if not exists accounts_created_at_idx     on public.accounts (created_at desc);

drop trigger if exists accounts_set_updated_at on public.accounts;
create trigger accounts_set_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- RLS: sirf server (service_role key) hi is table ko chhoo sakta hai
-- ------------------------------------------------------------
alter table public.accounts enable row level security;


-- >>>>>>>>>>>>>>>>>>>>  02_login.sql  <<<<<<<<<<<<<<<<<<<<

-- ============================================================
-- 02_login.sql  --  LOGIN PART
-- Sessions (login tokens) + password reset + email verify tokens
-- Depends on: 00_extensions.sql, 01_accounts.sql
-- ============================================================

-- ------------------------------------------------------------
-- Login sessions
-- App ek JWT cookie deta hai; uska SHA-256 hash yahan store hota hai
-- taake logout / revoke server side possible ho.
-- ------------------------------------------------------------
create table if not exists public.sessions (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid        not null references public.accounts(id) on delete cascade,  -- FK: kaunse account ka session hai -> accounts.id (account delete = sessions bhi delete)
  token_hash  text        not null,
  user_agent  text,
  ip_address  text,
  expires_at  timestamptz not null,
  revoked_at  timestamptz,
  created_at  timestamptz not null default now()
);

create unique index if not exists sessions_token_hash_key on public.sessions (token_hash);
create index if not exists sessions_account_id_idx        on public.sessions (account_id);
create index if not exists sessions_expires_at_idx        on public.sessions (expires_at);

-- ------------------------------------------------------------
-- Password reset tokens ("Forgot password" flow)
-- ------------------------------------------------------------
create table if not exists public.password_reset_tokens (
  id         uuid primary key default gen_random_uuid(),
  account_id uuid        not null references public.accounts(id) on delete cascade,  -- FK: kis account ka reset token -> accounts.id
  token_hash text        not null,
  expires_at timestamptz not null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists password_reset_tokens_hash_key on public.password_reset_tokens (token_hash);
create index if not exists password_reset_tokens_account_idx     on public.password_reset_tokens (account_id);

-- ------------------------------------------------------------
-- Email verification tokens
-- ------------------------------------------------------------
create table if not exists public.email_verification_tokens (
  id         uuid primary key default gen_random_uuid(),
  account_id uuid        not null references public.accounts(id) on delete cascade,  -- FK: kis account ka verify token -> accounts.id
  token_hash text        not null,
  expires_at timestamptz not null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists email_verification_tokens_hash_key on public.email_verification_tokens (token_hash);

-- ------------------------------------------------------------
-- Expired / revoked sessions ko saaf karne wala helper
-- (Supabase pg_cron se schedule kar sakte ho)
-- ------------------------------------------------------------
create or replace function public.purge_expired_sessions()
returns integer
language plpgsql
as $$
declare
  deleted integer;
begin
  delete from public.sessions
  where expires_at < now() or revoked_at is not null;
  get diagnostics deleted = row_count;

  delete from public.password_reset_tokens where expires_at < now();
  delete from public.email_verification_tokens where expires_at < now();

  return deleted;
end;
$$;

alter table public.sessions                  enable row level security;
alter table public.password_reset_tokens     enable row level security;
alter table public.email_verification_tokens enable row level security;


-- >>>>>>>>>>>>>>>>>>>>  03_profiles.sql  <<<<<<<<<<<<<<<<<<<<

-- ============================================================
-- 03_profiles.sql  --  PROFILE PART
-- Job seeker / recruiter ka extra profile data
-- Depends on: 00_extensions.sql, 01_accounts.sql
-- ============================================================

create table if not exists public.profiles (
  account_id  uuid primary key references public.accounts(id) on delete cascade,  -- PK + FK: har account ki EK profile (1:1) -> accounts.id
  phone       text,
  bio         text,
  skills      text[]      not null default '{}',
  experience  text,
  education   text,
  resume_url  text,
  location    text,
  website     text,
  linkedin    text,
  github      text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists profiles_location_idx on public.profiles (location);
create index if not exists profiles_skills_idx   on public.profiles using gin (skills);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Naya account bante hi khali profile row bana do
create or replace function public.create_profile_for_account()
returns trigger
language plpgsql
as $$
begin
  insert into public.profiles (account_id)
  values (new.id)
  on conflict (account_id) do nothing;
  return new;
end;
$$;

drop trigger if exists accounts_create_profile on public.accounts;
create trigger accounts_create_profile
  after insert on public.accounts
  for each row execute function public.create_profile_for_account();

alter table public.profiles enable row level security;


-- >>>>>>>>>>>>>>>>>>>>  04_settings.sql  <<<<<<<<<<<<<<<<<<<<

-- ============================================================
-- 04_settings.sql  --  SETTINGS PART
-- Dashboard ke Settings tab ke toggles
-- Depends on: 00_extensions.sql, 01_accounts.sql
-- ============================================================

create table if not exists public.user_settings (
  account_id          uuid primary key references public.accounts(id) on delete cascade,  -- PK + FK: har account ki EK settings row (1:1) -> accounts.id
  email_notifications boolean     not null default true,
  job_alerts          boolean     not null default true,
  profile_visibility  boolean     not null default false,
  two_factor_auth     boolean     not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

-- Naya account bante hi default settings row bana do
create or replace function public.create_settings_for_account()
returns trigger
language plpgsql
as $$
begin
  insert into public.user_settings (account_id)
  values (new.id)
  on conflict (account_id) do nothing;
  return new;
end;
$$;

drop trigger if exists accounts_create_settings on public.accounts;
create trigger accounts_create_settings
  after insert on public.accounts
  for each row execute function public.create_settings_for_account();

alter table public.user_settings enable row level security;


-- >>>>>>>>>>>>>>>>>>>>  05_companies.sql  <<<<<<<<<<<<<<<<<<<<

-- ============================================================
-- 05_companies.sql  --  COMPANY PART
-- /companies page ka data
-- Depends on: 00_extensions.sql, 01_accounts.sql
-- ============================================================

create table if not exists public.companies (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid        references public.accounts(id) on delete set null,  -- FK: company kis user ne banai -> accounts.id (user delete = NULL ho jata hai)
  name        text        not null,
  slug        text        not null,
  description text,
  industry    text,
  location    text,
  logo_url    text,
  size        text,
  website     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index if not exists companies_slug_key    on public.companies (slug);
create index if not exists companies_name_idx           on public.companies (lower(name));
create index if not exists companies_industry_idx       on public.companies (industry);
create index if not exists companies_name_trgm_idx      on public.companies using gin (name gin_trgm_ops);

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

alter table public.companies enable row level security;


-- >>>>>>>>>>>>>>>>>>>>  06_job_post.sql  <<<<<<<<<<<<<<<<<<<<

-- ============================================================
-- 06_job_post.sql  --  JOB POST PART
-- Recruiter jo job post karta hai
-- Depends on: 00_extensions.sql, 01_accounts.sql, 05_companies.sql
-- ============================================================

create table if not exists public.jobs (
  id               uuid primary key default gen_random_uuid(),
  recruiter_id     uuid        not null references public.accounts(id) on delete cascade,  -- FK: job kis recruiter ne post ki -> accounts.id (1 recruiter : N jobs)
  company_id       uuid        references public.companies(id) on delete set null,  -- FK: job kis company ki hai -> companies.id (1 company : N jobs)

  job_title        text        not null,
  company_name     text        not null,
  company_logo     text,
  job_description  text        not null,
  job_type         text        not null,
  experience_level text        not null,
  category         text        not null,
  required_skills  text[]      not null default '{}',
  location         text        not null,
  salary_min       integer     not null default 0,
  salary_max       integer     not null default 0,
  deadline         date,
  is_test_required boolean     not null default false,
  openings         integer,
  contact_email    text        not null,
  apply_link       text,
  status           text        not null default 'active',
  views            integer     not null default 0,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint jobs_status_valid check (status in ('active', 'paused', 'closed')),
  constraint jobs_salary_range check (salary_max >= salary_min)
);

create index if not exists jobs_recruiter_id_idx  on public.jobs (recruiter_id);
create index if not exists jobs_company_id_idx    on public.jobs (company_id);
create index if not exists jobs_created_at_idx    on public.jobs (created_at desc);
create index if not exists jobs_job_type_idx      on public.jobs (job_type);
create index if not exists jobs_experience_idx    on public.jobs (experience_level);
create index if not exists jobs_category_idx      on public.jobs (category);
create index if not exists jobs_status_idx        on public.jobs (status);
create index if not exists jobs_salary_idx        on public.jobs (salary_min, salary_max);
create index if not exists jobs_skills_idx        on public.jobs using gin (required_skills);
create index if not exists jobs_company_name_idx  on public.jobs (lower(company_name));

-- Search (ilike '%...%') ko fast karne ke liye trigram indexes
create index if not exists jobs_title_trgm_idx    on public.jobs using gin (job_title gin_trgm_ops);
create index if not exists jobs_company_trgm_idx  on public.jobs using gin (company_name gin_trgm_ops);
create index if not exists jobs_location_trgm_idx on public.jobs using gin (location gin_trgm_ops);

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- View counter (API se rpc('increment_job_views') call hota hai)
-- ------------------------------------------------------------
create or replace function public.increment_job_views(p_job_id uuid)
returns integer
language plpgsql
as $$
declare
  new_views integer;
begin
  update public.jobs
     set views = views + 1
   where id = p_job_id
  returning views into new_views;

  return coalesce(new_views, 0);
end;
$$;

alter table public.jobs enable row level security;


-- >>>>>>>>>>>>>>>>>>>>  07_applications.sql  <<<<<<<<<<<<<<<<<<<<

-- ============================================================
-- 07_applications.sql  --  JOB APPLICATION PART
-- Job seeker jo application submit karta hai
-- Depends on: 00_extensions.sql, 01_accounts.sql, 06_job_post.sql
-- ============================================================

create table if not exists public.applications (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid        not null references public.jobs(id) on delete cascade,  -- FK: kis job pe apply kiya -> jobs.id (job delete = applications delete)
  applicant_id    uuid        not null references public.accounts(id) on delete cascade,  -- FK: kis job seeker ne apply kiya -> accounts.id

  cover_letter    text,
  resume          text,
  custom_fields   jsonb       not null default '{}'::jsonb,
  applicant_score integer,
  status          text        not null default 'pending',

  -- Snapshot fields (apply ke waqt ki values, baad me job edit ho to bhi safe)
  name            text,
  email           text,
  phone           text,
  skills          text,
  bio             text,
  education       text,
  job_title       text,
  company_name    text,
  location        text,

  applied_at      timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint applications_status_valid
    check (status in ('pending', 'reviewing', 'interview', 'rejected', 'hired'))
);

-- Ek user ek job pe sirf ek hi baar apply kar sakta hai
create unique index if not exists applications_job_applicant_key
  on public.applications (job_id, applicant_id);

create index if not exists applications_job_id_idx       on public.applications (job_id);
create index if not exists applications_applicant_id_idx on public.applications (applicant_id);
create index if not exists applications_status_idx       on public.applications (status);
create index if not exists applications_applied_at_idx   on public.applications (applied_at desc);

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Recruiter ke dashboard ke liye: har job pe kitni applications
-- ------------------------------------------------------------
create or replace view public.job_application_counts as
select
  j.id                       as job_id,
  j.recruiter_id,
  count(a.id)                as total,
  count(a.id) filter (where a.status = 'pending')   as pending,
  count(a.id) filter (where a.status = 'reviewing') as reviewing,
  count(a.id) filter (where a.status = 'interview') as interview,
  count(a.id) filter (where a.status = 'rejected')  as rejected,
  count(a.id) filter (where a.status = 'hired')     as hired
from public.jobs j
left join public.applications a on a.job_id = j.id
group by j.id, j.recruiter_id;

alter table public.applications enable row level security;


-- >>>>>>>>>>>>>>>>>>>>  08_saved_jobs.sql  <<<<<<<<<<<<<<<<<<<<

-- ============================================================
-- 08_saved_jobs.sql  --  SAVED JOBS / BOOKMARK PART
-- Depends on: 00_extensions.sql, 01_accounts.sql, 06_job_post.sql
-- ============================================================

create table if not exists public.saved_jobs (
  account_id uuid        not null references public.accounts(id) on delete cascade,  -- FK: kis user ne save ki -> accounts.id
  job_id     uuid        not null references public.jobs(id) on delete cascade,  -- FK: kaunsi job save hui -> jobs.id
  created_at timestamptz not null default now(),
  primary key (account_id, job_id)
);

create index if not exists saved_jobs_account_id_idx on public.saved_jobs (account_id);
create index if not exists saved_jobs_job_id_idx     on public.saved_jobs (job_id);

alter table public.saved_jobs enable row level security;


-- >>>>>>>>>>>>>>>>>>>>  09_rls_policies.sql  <<<<<<<<<<<<<<<<<<<<

-- ============================================================
-- 09_rls_policies.sql  --  SECURITY PART
-- Depends on: sab pichli files
--
-- App ka server SUPABASE_SERVICE_ROLE_KEY use karta hai jo RLS
-- bypass karta hai. Isliye default = deny-all (koi policy nahi),
-- aur sirf public browse data (active jobs + companies) ko
-- anon key ke liye read-only khola gaya hai.
-- ============================================================

-- ------------------------------------------------------------
-- Public read: sirf active jobs
-- ------------------------------------------------------------
drop policy if exists "jobs_public_read" on public.jobs;
create policy "jobs_public_read"
  on public.jobs
  for select
  to anon, authenticated
  using (status = 'active');

-- ------------------------------------------------------------
-- Public read: companies
-- ------------------------------------------------------------
drop policy if exists "companies_public_read" on public.companies;
create policy "companies_public_read"
  on public.companies
  for select
  to anon, authenticated
  using (true);

-- ------------------------------------------------------------
-- Baaki sab tables pe koi policy nahi =>
-- anon/authenticated key se kuch bhi read/write nahi ho sakta.
-- accounts, sessions, password_reset_tokens,
-- email_verification_tokens, profiles, user_settings,
-- applications, saved_jobs  --> sirf service_role (server).
-- ------------------------------------------------------------

-- New Supabase projects no longer auto-grant privileges on new tables
-- to the API roles, so grant them explicitly.
-- service_role = the app's server: full access to everything.
grant usage on schema public to service_role, anon, authenticated;
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- anon / authenticated: read-only on the public browse tables
-- (the RLS policies above still limit jobs to status = 'active').
grant select on public.jobs, public.companies to anon, authenticated;

-- Anon role ko in tables pe table-level grant bhi mat do
revoke all on public.accounts                 from anon, authenticated;
revoke all on public.sessions                  from anon, authenticated;
revoke all on public.password_reset_tokens     from anon, authenticated;
revoke all on public.email_verification_tokens from anon, authenticated;
revoke all on public.profiles                  from anon, authenticated;
revoke all on public.user_settings             from anon, authenticated;
revoke all on public.applications              from anon, authenticated;
revoke all on public.saved_jobs                from anon, authenticated;

-- Recruiter stats wala view bhi sirf server ke liye
revoke all on public.job_application_counts    from anon, authenticated;


-- >>>>>>>>>>>>>>>>>>>>  10_seed.sql  <<<<<<<<<<<<<<<<<<<<

-- ============================================================
-- 10_seed.sql  --  DEMO DATA (optional)
-- Sirf development ke liye. Production pe mat chalao.
-- Depends on: sab pichli files
-- ============================================================

insert into public.companies (name, slug, description, industry, location, size, website, logo_url)
values
  ('TechNova',      'technova',      'Cloud aur AI products banane wali company.',        'Software',     'Karachi, PK',    '51-200',   'https://technova.example.com',  null),
  ('BrightHire',    'brighthire',    'HR tech startup jo hiring ko easy banati hai.',     'HR Tech',      'Lahore, PK',     '11-50',    'https://brighthire.example.com',null),
  ('Finlytics',     'finlytics',     'Fintech analytics platform.',                       'Fintech',      'Islamabad, PK',  '201-500',  'https://finlytics.example.com', null),
  ('PixelForge',    'pixelforge',    'Design aur creative studio.',                       'Design',       'Remote',         '11-50',    'https://pixelforge.example.com',null),
  ('DataHarbor',    'dataharbor',    'Data engineering aur warehousing solutions.',       'Data',         'Karachi, PK',    '51-200',   'https://dataharbor.example.com',null)
on conflict (slug) do nothing;
