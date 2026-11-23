-- ============================================================
-- lab07_joins.sql  --  LAB 07: PERFORMING AND MASTERING SQL JOINS
--
-- A JOIN combines rows from two or more tables using a related
-- column (usually a foreign key that points to a primary key).
-- In this project, data is split across tables (jobs, companies,
-- accounts, applications), so joins put it back together.
--
-- Topics covered:
--   1. INNER JOIN (simple join)
--   2. LEFT OUTER JOIN
--   3. RIGHT OUTER JOIN
--   4. FULL OUTER JOIN
--   5. CROSS JOIN
--   6. SELF JOIN
--
-- Depends on: lab00_demo_data.sql
-- SELECT queries only, no data is changed.
--
-- The demo data deliberately has some "missing" matches:
--   * the "Sales Intern" job has no company (company_id is NULL)
--   * DataHarbor company has no jobs
--   * Bilal Shah (recruiter) has posted no jobs
--   * Noor Fatima (job seeker) has not applied anywhere
-- These show the difference between the join types.
--
-- How to run in Supabase SQL Editor:
--   Highlight a query and click Run to see its result
--   (running the whole file only shows the LAST result).
-- ============================================================


-- ============================================================
-- 1) INNER JOIN
-- Returns only the rows that have a match in BOTH tables.
-- Rows without a match on either side are left out.
-- ============================================================

-- Jobs with their company. "Sales Intern" is missing (no company)
-- and DataHarbor is missing (no jobs).
select jobs.job_title, companies.name
  from public.jobs
 inner join public.companies
    on jobs.company_id = companies.id;

-- Three tables: which seeker applied to which job of which company
select accounts.full_name, jobs.job_title, jobs.company_name, applications.status
  from public.applications
 inner join public.accounts on applications.applicant_id = accounts.id
 inner join public.jobs     on applications.job_id       = jobs.id;


-- ============================================================
-- 2) LEFT OUTER JOIN
-- Returns ALL rows from the left table. When the right table has
-- no match, its columns are NULL.
-- ============================================================

-- All jobs, with or without a company ("Sales Intern" -> NULL company)
select jobs.job_title, companies.name
  from public.jobs
  left outer join public.companies
    on jobs.company_id = companies.id;

-- Sailors task: all job seekers and their applications, NULL when
-- the seeker has not applied (Noor Fatima)
select accounts.full_name, applications.job_title
  from public.accounts
  left join public.applications
    on applications.applicant_id = accounts.id
 where accounts.role = 'job_seeker';

-- Netflix / Shopping task: seekers who have not applied to anything
select accounts.full_name
  from public.accounts
  left join public.applications
    on applications.applicant_id = accounts.id
 where accounts.role = 'job_seeker'
   and applications.id is null;


-- ============================================================
-- 3) RIGHT OUTER JOIN
-- Returns ALL rows from the right table. When the left table has
-- no match, its columns are NULL.
-- ============================================================

-- All companies, with or without jobs (DataHarbor -> NULL job)
select jobs.job_title, companies.name
  from public.jobs
 right outer join public.companies
    on jobs.company_id = companies.id;

-- All jobs and their applicants, NULL for jobs nobody applied to
select applications.name, jobs.job_title
  from public.applications
 right join public.jobs
    on applications.job_id = jobs.id;


-- ============================================================
-- 4) FULL OUTER JOIN
-- Returns ALL rows from BOTH tables. Where there is no match,
-- the missing side is NULL.
-- (MySQL has no FULL JOIN; there it is LEFT JOIN UNION RIGHT JOIN.)
-- ============================================================

-- Both "Sales Intern" (no company) and DataHarbor (no job) appear
select jobs.job_title, companies.name
  from public.jobs
  full outer join public.companies
    on jobs.company_id = companies.id;

-- MySQL workaround (also works in PostgreSQL)
select jobs.job_title, companies.name
  from public.jobs
  left join public.companies on jobs.company_id = companies.id
union
select jobs.job_title, companies.name
  from public.jobs
 right join public.companies on jobs.company_id = companies.id;


-- ============================================================
-- 5) CROSS JOIN
-- Joins every row of the first table with every row of the second
-- table (Cartesian product). No ON condition.
-- 5 job seekers x 5 companies = 25 rows.
-- ============================================================
select accounts.full_name, companies.name
  from public.accounts
 cross join public.companies
 where accounts.role = 'job_seeker';


-- ============================================================
-- 6) SELF JOIN
-- Joins a table with itself. The same table gets two aliases
-- (j1, j2) so it can be compared row against row.
-- ============================================================

-- Pairs of different jobs from the same company
-- (j1.id < j2.id so each pair appears only once)
select j1.company_name, j1.job_title as job_1, j2.job_title as job_2
  from public.jobs j1, public.jobs j2
 where j1.company_name = j2.company_name
   and j1.id < j2.id;

-- Pairs of seekers who applied to the same job
select a1.job_title, a1.name as applicant_1, a2.name as applicant_2
  from public.applications a1, public.applications a2
 where a1.job_id = a2.job_id
   and a1.applicant_id < a2.applicant_id;
