-- ============================================================
-- lab02_dml_operators.sql  --  LAB 02: SQL DML AND OPERATORS
--
-- Topics covered:
--   * DML: INSERT, UPDATE, DELETE, SELECT
--   * TRUNCATE, and TRUNCATE vs DELETE
--   * SELECT *, specific columns, WHERE
--   * DISTINCT, COUNT(), TOP (PostgreSQL: LIMIT)
--   * AS (column and table alias / renaming)
--   * IN, BETWEEN, ORDER BY ASC / DESC
--   * Pattern matching: LIKE
--   * NULL values: IS NULL
--   * Logical operators: AND, OR, NOT
--   * Renaming a column and a table
--
-- Depends on: lab00_demo_data.sql
-- SELECT queries read the project's public tables. INSERT / UPDATE /
-- DELETE / TRUNCATE run on "lab" tables so the app's data stays safe.
--
-- How to run in Supabase SQL Editor:
--   1. Run the whole file once (it only shows the LAST result).
--   2. To see any single query's result, highlight it and click Run.
-- ============================================================


-- ============================================================
-- 0) Practice table
-- A small table that the INSERT / UPDATE / DELETE examples change.
-- ============================================================
drop table if exists lab.job_practice;

create table lab.job_practice (
  job_no       int primary key,
  job_title    varchar(100),
  company_name varchar(100),
  category     varchar(30),
  location     varchar(50),
  salary_min   int,
  salary_max   int,
  openings     int,
  added_date   date
);


-- ============================================================
-- 1) INSERT INTO
-- INSERT adds new rows to a table. List the columns, then the values
-- in the same order.
-- ============================================================

-- One row
insert into lab.job_practice (job_no, job_title, company_name, category, location, salary_min, salary_max, openings, added_date)
values (1, 'Frontend Developer', 'TechNova',   'IT',      'Karachi',   80000,  120000, 2, '2026-09-20');

-- Several rows at once
insert into lab.job_practice (job_no, job_title, company_name, category, location, salary_min, salary_max, openings, added_date)
values (2, 'Data Analyst',       'Finlytics',  'Finance', 'Islamabad', 50000,  70000,  3, '2026-10-01'),
       (3, 'QA Engineer',        'TechNova',   'IT',      'Karachi',   70000,  95000,  2, '2026-10-05'),
       (4, 'Support Officer',    'BrightHire', 'HR',      'Lahore',    35000,  45000,  4, '2026-10-08'),
       (5, 'SEO Specialist',     'PixelForge', 'Sales',   'Remote',    60000,  80000,  1, null),
       (6, 'Scrum Master',       'Finlytics',  'IT',      'Islamabad', 160000, 200000, 1, '2026-10-12'),
       (7, 'Account Officer',    'Finlytics',  'Finance', 'Karachi',   45000,  60000,  2, null);


-- ============================================================
-- 2) SELECT
-- SELECT reads data. * means all columns; WHERE keeps only the rows
-- that match a condition.
-- ============================================================

-- All columns
select * from lab.job_practice;

-- Specific columns
select job_title, company_name, salary_max from lab.job_practice;

-- With a condition (project jobs table): active jobs only
select job_title, company_name, status
  from public.jobs
 where status = 'active';


-- ============================================================
-- 3) UPDATE
-- UPDATE changes values in existing rows. SET gives the new values,
-- WHERE picks the rows. Without WHERE, EVERY row is updated.
-- ============================================================

-- Set openings of job_no 3 to 5 (like Task 1.5)
update lab.job_practice
   set openings = 5
 where job_no = 3;

-- Several columns at once: raise IT salaries by 10%
update lab.job_practice
   set salary_min = salary_min * 1.10,
       salary_max = salary_max * 1.10
 where category = 'IT';

select * from lab.job_practice;


-- ============================================================
-- 4) DELETE
-- DELETE removes rows. WHERE picks which rows; without WHERE all rows
-- are deleted (but the table stays).
-- ============================================================

-- Delete job_no 5 (like Task 1.6)
delete from lab.job_practice
 where job_no = 5;


-- ============================================================
-- 5) TRUNCATE vs DELETE
--   DELETE   = DML, can use WHERE, can be undone with ROLLBACK.
--   TRUNCATE = DDL, no WHERE, empties the whole table,
--              the table structure stays.
--
--   NOTE: Supabase SQL Editor runs the whole file as one
--   transaction, so the ROLLBACK demo is commented out.
--   Uncomment it, highlight only these lines and click Run.
-- ============================================================

-- begin;
--   delete from lab.job_practice where category = 'Finance';
--   select * from lab.job_practice;
-- rollback;
-- select * from lab.job_practice;   -- the Finance rows are back


-- ============================================================
-- 6) DISTINCT: unique values only
-- DISTINCT removes duplicate rows from the result.
-- ============================================================

-- Which categories exist (Task 1.8)
select distinct category from public.jobs;

-- Unique combination of two columns
select distinct category, job_type from public.jobs;


-- ============================================================
-- 7) COUNT()
-- COUNT() returns how many rows (or non-NULL values) there are.
-- ============================================================
select count(id) from public.jobs;


-- ============================================================
-- 8) TOP: the first N rows
--   SQL Server: SELECT TOP 3 job_title, views FROM jobs ORDER BY views DESC;
--   PostgreSQL / MySQL use LIMIT
-- TOP / LIMIT returns only the first N rows of the result,
-- usually together with ORDER BY.
-- ============================================================
select job_title, views
  from public.jobs
 order by views desc
 limit 3;


-- ============================================================
-- 9) AS: alias (renaming)
-- AS gives a column or table a temporary name in the result.
-- The real table is not renamed.
-- ============================================================

-- Column alias
select job_title    as job,
       company_name as company,
       salary_max   as max_salary
  from public.jobs;

-- Table alias
select j.job_title, j.location
  from public.jobs as j;


-- ============================================================
-- 10) IN: any value from a list
-- IN is a short way of writing many OR conditions on one column.
-- ============================================================
select job_title, location
  from public.jobs
 where location in ('Karachi', 'Lahore');


-- ============================================================
-- 11) BETWEEN: inside a range
-- BETWEEN a AND b keeps values from a to b (both included).
-- ============================================================

-- "IT" category with min salary between 80,000 and 160,000 (like Task 1.4)
select job_title, category, salary_min
  from public.jobs
 where category = 'IT'
   and salary_min between 80000 and 160000;


-- ============================================================
-- 12) ORDER BY: sorting
-- ORDER BY sorts the result. ASC = small to big (default),
-- DESC = big to small.
-- ============================================================

-- Highest salary first (Task 1.10)
select job_title, salary_max from public.jobs order by salary_max desc;

-- Names A -> Z (Task 2.10)
select full_name, role from public.accounts order by full_name asc;


-- ============================================================
-- 13) PATTERN MATCHING: LIKE
--   %  = any number of characters (0 or more)
--   _  = exactly one character
-- ============================================================

-- Jobs that start with "D" (Task 1.11)
select job_title from public.jobs where job_title like 'D%';

-- Names that contain "a" anywhere (Task 2.11)
select full_name from public.accounts where full_name like '%a%';


-- ============================================================
-- 14) NULL values: IS NULL
-- NULL means "no value". It cannot be compared with =, so use IS NULL.
-- ============================================================

-- Jobs without a deadline
select job_title, deadline from public.jobs where deadline is null;

-- Rows where added_date is NULL (Task 1.12)
select * from lab.job_practice where added_date is null;


-- ============================================================
-- 15) LOGICAL OPERATORS: AND, OR, NOT
-- AND: both conditions must be true. OR: at least one must be true.
-- NOT: reverses a condition.
-- ============================================================

-- AND (like Task 1.13): openings > 1 and salary < 200,000
select job_title, openings, salary_max
  from public.jobs
 where openings > 1
   and salary_max < 200000;

-- OR
select job_title, location, job_type
  from public.jobs
 where location = 'Remote' or job_type = 'Internship';

-- NOT (like Task 2.13): salary > 60,000 and category is not IT
select job_title, category, salary_max
  from public.jobs
 where salary_max > 60000
   and not category = 'IT';


-- ============================================================
-- 16) RENAME COLUMN / RENAME TABLE / TRUNCATE (Task 1.7, 1.9, 2.9)
-- Done on a separate table so lab.job_practice above keeps its
-- name and columns.
-- Renaming changes the name only, the data stays. TRUNCATE deletes
-- all rows at once but keeps the table structure.
-- ============================================================
drop table if exists lab.job_archive;
drop table if exists lab.job_history;

create table lab.job_archive (
  job_no     int primary key,
  job_title  varchar(100),
  salary_max int
);

insert into lab.job_archive values (1, 'Frontend Developer', 120000), (2, 'Data Analyst', 70000);

-- Rename a column: salary_max -> max_salary
alter table lab.job_archive rename column salary_max to max_salary;

select job_title, max_salary from lab.job_archive;

-- Rename a table: job_archive -> job_history
-- MySQL: RENAME TABLE job_archive TO job_history
alter table lab.job_archive rename to job_history;

-- Rename it back: after a run, the Supabase SQL Editor looks up every
-- table the script created by its original name, and shows
-- "relation ... does not exist" if it was renamed.
alter table lab.job_history rename to job_archive;

-- TRUNCATE: rows are gone, the structure stays
truncate table lab.job_archive;
select * from lab.job_archive;   -- empty, but the columns are still there
