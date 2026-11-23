-- ============================================================
-- lab00_demo_data.sql  --  DEMO DATA FOR THE LAB QUERIES
-- The lab files (lab01 ... lab08) need some rows to show results.
-- This file inserts that data.
--
-- Depends on: sql/schema.sql (the project schema must exist first)
-- For development / lab practice only. Do not run in production.
--
-- Fixed UUIDs are used so running this file again does not create
-- duplicates (on conflict do nothing).
-- The demo accounts have a fake password_hash -> they cannot log in.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Companies (same as 10_seed.sql; skipped if they already exist)
-- ------------------------------------------------------------
insert into public.companies (name, slug, description, industry, location, size, website)
values
  ('TechNova',   'technova',   'Builds cloud and AI products.',            'Software', 'Karachi, PK',   '51-200',  'https://technova.example.com'),
  ('BrightHire', 'brighthire', 'HR tech startup that makes hiring easy.',  'HR Tech',  'Lahore, PK',    '11-50',   'https://brighthire.example.com'),
  ('Finlytics',  'finlytics',  'Fintech analytics platform.',              'Fintech',  'Islamabad, PK', '201-500', 'https://finlytics.example.com'),
  ('PixelForge', 'pixelforge', 'Design and creative studio.',              'Design',   'Remote',        '11-50',   'https://pixelforge.example.com'),
  ('DataHarbor', 'dataharbor', 'Data engineering and warehousing.',        'Data',     'Karachi, PK',   '51-200',  'https://dataharbor.example.com')
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- 2) Accounts (3 recruiters, 5 job seekers, 1 admin)
--    Profile and settings rows are created by triggers.
-- ------------------------------------------------------------
insert into public.accounts (id, email, password_hash, full_name, role, email_verified, created_at)
values
  ('00000000-0000-0000-0000-0000000000a1', 'ahmed.khan@demo.pk',  'demo-not-a-real-hash', 'Ahmed Khan',  'recruiter',  true,  now() - interval '400 days'),
  ('00000000-0000-0000-0000-0000000000a2', 'sara.ali@demo.pk',    'demo-not-a-real-hash', 'Sara Ali',    'recruiter',  true,  now() - interval '300 days'),
  ('00000000-0000-0000-0000-0000000000a3', 'bilal.shah@demo.pk',  'demo-not-a-real-hash', 'Bilal Shah',  'recruiter',  false, now() - interval '20 days'),
  ('00000000-0000-0000-0000-0000000000b1', 'ali.raza@demo.pk',    'demo-not-a-real-hash', 'Ali Raza',    'job_seeker', true,  now() - interval '200 days'),
  ('00000000-0000-0000-0000-0000000000b2', 'ayesha.noor@demo.pk', 'demo-not-a-real-hash', 'Ayesha Noor', 'job_seeker', true,  now() - interval '150 days'),
  ('00000000-0000-0000-0000-0000000000b3', 'hina.malik@demo.pk',  'demo-not-a-real-hash', 'Hina Malik',  'job_seeker', true,  now() - interval '90 days'),
  ('00000000-0000-0000-0000-0000000000b4', 'zain.ahmed@demo.pk',  'demo-not-a-real-hash', 'Zain Ahmed',  'job_seeker', false, now() - interval '45 days'),
  ('00000000-0000-0000-0000-0000000000b5', 'noor.fatima@demo.pk', 'demo-not-a-real-hash', 'Noor Fatima', 'job_seeker', true,  now() - interval '10 days'),
  ('00000000-0000-0000-0000-0000000000c1', 'admin@demo.pk',       'demo-not-a-real-hash', 'Site Admin',  'admin',      true,  now() - interval '500 days')
on conflict do nothing;

-- ------------------------------------------------------------
-- 3) Jobs (8 jobs). Some have a NULL deadline / openings / company
--    so the IS NULL and OUTER JOIN queries return something.
--    DataHarbor has no jobs       -> RIGHT / FULL JOIN demo.
--    Bilal Shah posted no jobs    -> LEFT JOIN demo.
-- ------------------------------------------------------------
insert into public.jobs (
  id, recruiter_id, company_id, job_title, company_name, job_description,
  job_type, experience_level, category, required_skills, location,
  salary_min, salary_max, deadline, openings, contact_email, status, views, created_at
)
values
  ('00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-0000000000a1',
   (select id from public.companies where slug = 'technova'),
   'Frontend Developer', 'TechNova', 'Build web apps with React and Next.js.',
   'Full-time', 'Mid', 'IT', array['React','JavaScript','CSS'], 'Karachi',
   80000, 120000, current_date + 30, 2, 'jobs@technova.example.com', 'active', 120, now() - interval '25 days'),

  ('00000000-0000-0000-0000-00000000d002', '00000000-0000-0000-0000-0000000000a1',
   (select id from public.companies where slug = 'technova'),
   'Backend Developer', 'TechNova', 'Node.js APIs and PostgreSQL.',
   'Full-time', 'Senior', 'IT', array['Node.js','SQL','Docker'], 'Karachi',
   150000, 220000, null, 1, 'jobs@technova.example.com', 'active', 300, now() - interval '18 days'),

  ('00000000-0000-0000-0000-00000000d003', '00000000-0000-0000-0000-0000000000a1',
   (select id from public.companies where slug = 'pixelforge'),
   'UI/UX Designer', 'PixelForge', 'Design mobile and web interfaces.',
   'Contract', 'Mid', 'Design', array['Figma','Prototyping'], 'Remote',
   60000, 90000, current_date + 10, null, 'hr@pixelforge.example.com', 'paused', 45, now() - interval '40 days'),

  ('00000000-0000-0000-0000-00000000d004', '00000000-0000-0000-0000-0000000000a2',
   (select id from public.companies where slug = 'finlytics'),
   'Data Analyst', 'Finlytics', 'Analyse financial data and build dashboards.',
   'Full-time', 'Entry', 'Finance', array['SQL','Excel','Power BI'], 'Islamabad',
   50000, 70000, current_date + 15, 3, 'careers@finlytics.example.com', 'active', 210, now() - interval '12 days'),

  ('00000000-0000-0000-0000-00000000d005', '00000000-0000-0000-0000-0000000000a2',
   (select id from public.companies where slug = 'finlytics'),
   'Financial Accountant', 'Finlytics', 'Monthly closing and reporting.',
   'Full-time', 'Mid', 'Finance', array['Accounting','Excel'], 'Karachi',
   90000, 130000, current_date - 5, 1, 'careers@finlytics.example.com', 'closed', 80, now() - interval '60 days'),

  ('00000000-0000-0000-0000-00000000d006', '00000000-0000-0000-0000-0000000000a2',
   (select id from public.companies where slug = 'finlytics'),
   'Data Engineer', 'Finlytics', 'ETL pipelines and data warehouse.',
   'Full-time', 'Senior', 'IT', array['Python','SQL','Spark'], 'Lahore',
   180000, 250000, current_date + 45, 2, 'careers@finlytics.example.com', 'active', 150, now() - interval '7 days'),

  ('00000000-0000-0000-0000-00000000d007', '00000000-0000-0000-0000-0000000000a2',
   (select id from public.companies where slug = 'brighthire'),
   'HR Executive', 'BrightHire', 'Handle recruitment and onboarding.',
   'Part-time', 'Entry', 'HR', array['Communication','Excel'], 'Lahore',
   40000, 55000, null, 1, 'team@brighthire.example.com', 'active', 30, now() - interval '5 days'),

  -- company_id is NULL (company not in the list) -> NULL in LEFT JOIN
  ('00000000-0000-0000-0000-00000000d008', '00000000-0000-0000-0000-0000000000a2',
   null,
   'Sales Intern', 'Local Traders', 'Three month paid internship.',
   'Internship', 'Entry', 'Sales', array['Communication'], 'Lahore',
   17500, 20000, current_date + 7, null, 'info@localtraders.example.com', 'active', 10, now() - interval '2 days')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 4) Applications (which seeker applied to which job)
--    Noor Fatima applied nowhere.
--    UI/UX Designer, Financial Accountant, Sales Intern have no applications.
-- ------------------------------------------------------------
insert into public.applications (job_id, applicant_id, status, applicant_score, name, email, job_title, company_name, applied_at)
values
  ('00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-0000000000b1', 'interview', 85,   'Ali Raza',    'ali.raza@demo.pk',    'Frontend Developer', 'TechNova',   now() - interval '20 days'),
  ('00000000-0000-0000-0000-00000000d002', '00000000-0000-0000-0000-0000000000b1', 'pending',   70,   'Ali Raza',    'ali.raza@demo.pk',    'Backend Developer',  'TechNova',   now() - interval '15 days'),
  ('00000000-0000-0000-0000-00000000d006', '00000000-0000-0000-0000-0000000000b1', 'reviewing', 78,   'Ali Raza',    'ali.raza@demo.pk',    'Data Engineer',      'Finlytics',  now() - interval '5 days'),
  ('00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-0000000000b2', 'hired',     92,   'Ayesha Noor', 'ayesha.noor@demo.pk', 'Frontend Developer', 'TechNova',   now() - interval '22 days'),
  ('00000000-0000-0000-0000-00000000d004', '00000000-0000-0000-0000-0000000000b2', 'reviewing', 80,   'Ayesha Noor', 'ayesha.noor@demo.pk', 'Data Analyst',       'Finlytics',  now() - interval '10 days'),
  ('00000000-0000-0000-0000-00000000d004', '00000000-0000-0000-0000-0000000000b3', 'rejected',  55,   'Hina Malik',  'hina.malik@demo.pk',  'Data Analyst',       'Finlytics',  now() - interval '9 days'),
  ('00000000-0000-0000-0000-00000000d007', '00000000-0000-0000-0000-0000000000b3', 'pending',   null, 'Hina Malik',  'hina.malik@demo.pk',  'HR Executive',       'BrightHire', now() - interval '3 days'),
  ('00000000-0000-0000-0000-00000000d002', '00000000-0000-0000-0000-0000000000b4', 'interview', 88,   'Zain Ahmed',  'zain.ahmed@demo.pk',  'Backend Developer',  'TechNova',   now() - interval '14 days'),
  ('00000000-0000-0000-0000-00000000d006', '00000000-0000-0000-0000-0000000000b4', 'pending',   74,   'Zain Ahmed',  'zain.ahmed@demo.pk',  'Data Engineer',      'Finlytics',  now() - interval '4 days')
on conflict (job_id, applicant_id) do nothing;

-- ------------------------------------------------------------
-- 5) Saved jobs (bookmarks)
-- ------------------------------------------------------------
insert into public.saved_jobs (account_id, job_id)
values
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-00000000d004'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-00000000d006'),
  ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-00000000d001'),
  ('00000000-0000-0000-0000-0000000000b5', '00000000-0000-0000-0000-00000000d002'),
  ('00000000-0000-0000-0000-0000000000b5', '00000000-0000-0000-0000-00000000d008')
on conflict do nothing;

-- ------------------------------------------------------------
-- 6) Practice schema
--    Queries that create / change / delete (DDL, UPDATE, DELETE,
--    TRUNCATE) run in the "lab" schema so the app's real public
--    tables are never touched. The Supabase API only exposes the
--    "public" schema, so "lab" is not reachable from the browser.
-- ------------------------------------------------------------
create schema if not exists lab;
