-- ============================================================
-- lab09_indexes_views.sql  --  INDEXES AND VIEWS
--
-- Topics covered:
--   1. Index: CREATE INDEX, UNIQUE INDEX, composite index,
--      DROP INDEX, listing the indexes of a table
--   2. View: CREATE VIEW, selecting from a view,
--      CREATE OR REPLACE VIEW, view with a JOIN, DROP VIEW
--
-- Depends on: lab00_demo_data.sql
-- The new indexes and views are created in the "lab" schema so the
-- app's tables are not changed.
--
-- How to run in Supabase SQL Editor:
--   1. Run the whole file once (it only shows the LAST result).
--   2. To see any single query's result, highlight it and click Run.
-- ============================================================


-- ============================================================
-- 1) INDEX
-- An index is a separate lookup structure (a B-Tree by default)
-- that lets the database find rows fast without reading the whole
-- table, like the index at the back of a book.
--   + makes SELECT ... WHERE / ORDER BY / JOIN on that column faster
--   - takes extra space and makes INSERT / UPDATE a little slower
-- A PRIMARY KEY and a UNIQUE constraint create an index automatically.
-- ============================================================

-- A practice copy of the jobs table to build indexes on
drop table if exists lab.job_search;

create table lab.job_search (
  job_id       uuid primary key,          -- primary key -> index created automatically
  job_title    text,
  company_name text,
  category     text,
  location     text,
  salary_max   int,
  contact_email text
);

insert into lab.job_search
select id, job_title, company_name, category, location, salary_max, contact_email
  from public.jobs;

-- CREATE INDEX: speeds up searches by category
-- e.g.  select * from lab.job_search where category = 'IT';
create index idx_job_search_category on lab.job_search (category);

-- UNIQUE INDEX: fast lookup AND no duplicate values allowed
create unique index idx_job_search_title_company on lab.job_search (job_title, company_name);

-- COMPOSITE INDEX: one index on two columns.
-- Helps queries that filter on location, or on location + salary.
create index idx_job_search_location_salary on lab.job_search (location, salary_max);

-- An index on the result of a function: case-insensitive search by company
-- e.g.  select * from lab.job_search where lower(company_name) = 'technova';
create index idx_job_search_company_lower on lab.job_search (lower(company_name));

-- List all indexes of a table (SQL Server: EXEC sp_helpindex 'job_search';)
select indexname, indexdef
  from pg_indexes
 where schemaname = 'lab'
   and tablename = 'job_search';

-- EXPLAIN shows how the database runs a query. On a big table it shows
-- "Index Scan using idx_job_search_category" instead of reading every row
-- ("Seq Scan"). On a small table like this one PostgreSQL may still
-- choose a Seq Scan because that is faster for few rows.
explain select * from lab.job_search where category = 'IT';

-- DROP INDEX
drop index lab.idx_job_search_company_lower;

-- The project already uses indexes, e.g. in sql/06_job_post.sql:
--   create index jobs_category_idx on public.jobs (category);
-- List the indexes of the project's jobs table:
select indexname, indexdef
  from pg_indexes
 where schemaname = 'public'
   and tablename = 'jobs';


-- ============================================================
-- 2) VIEW
-- A view is a saved SELECT query that behaves like a virtual table.
-- It stores no data of its own; every time you select from it, it
-- runs its query on the real tables, so it is always up to date.
--   + hides a complex query behind a simple name
--   + security: show only some columns / rows to a user
-- ============================================================

-- Start clean so the file can be run again
-- (CREATE OR REPLACE VIEW cannot remove a column the view already has)
drop view if exists lab.active_jobs;

-- CREATE VIEW: only active jobs, only the public columns
create view lab.active_jobs as
select job_title, company_name, category, location, salary_min, salary_max
  from public.jobs
 where status = 'active';

-- Select from a view exactly like from a table
select * from lab.active_jobs;
select * from lab.active_jobs where category = 'IT';

-- View with a JOIN + GROUP BY: number of applications per company
create or replace view lab.company_application_stats as
select c.name as company, count(a.id) as total_applications
  from public.companies c
  left join public.jobs j         on j.company_id = c.id
  left join public.applications a on a.job_id = j.id
 group by c.name;

select * from lab.company_application_stats;

-- CREATE OR REPLACE VIEW: change the view's query
-- (here: also show the number of openings)
create or replace view lab.active_jobs as
select job_title, company_name, category, location, salary_min, salary_max, openings
  from public.jobs
 where status = 'active';

select * from lab.active_jobs;

-- List all views in the lab schema
select table_name
  from information_schema.views
 where table_schema = 'lab';

-- DROP VIEW (only the view is removed, the jobs table is not touched)
create or replace view lab.drop_demo_view as select job_title from public.jobs;
drop view lab.drop_demo_view;

-- Create it again so the Supabase SQL Editor can find every object
-- this script created by its name after the run
create or replace view lab.drop_demo_view as select job_title from public.jobs;

-- The project already uses a view, in sql/07_applications.sql:
-- job_application_counts = applications per job for the recruiter dashboard
select * from public.job_application_counts;
