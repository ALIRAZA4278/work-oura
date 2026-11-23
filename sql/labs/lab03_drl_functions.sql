-- ============================================================
-- lab03_drl_functions.sql  --  LAB 03: DATA RETRIEVAL LANGUAGE (DRL) AND FUNCTIONS
--
-- Topics covered:
--   * WHERE, GROUP BY, HAVING, ORDER BY
--   * UNION, INTERSECT, MINUS (PostgreSQL: EXCEPT)
--   * Aggregate functions: COUNT, SUM, AVG, MAX, MIN
--   * Date functions: SYSDATE / CURRENT_DATE, TO_DATE, TO_CHAR, EXTRACT
--   * String functions: CONCAT, SUBSTR, LENGTH, UPPER, LOWER, TRIM
--   * Mathematical functions: ROUND, FLOOR, CEIL, MOD
--
-- Depends on: lab00_demo_data.sql
-- SELECT queries only, no data is changed.
--
-- How to run in Supabase SQL Editor:
--   Highlight a query and click Run to see its result
--   (running the whole file only shows the LAST result).
-- ============================================================


-- ============================================================
-- 1) WHERE: filter rows
-- DRL (Data Retrieval Language) is the SELECT statement. WHERE keeps
-- only the rows that meet the condition.
-- ============================================================

-- All jobs in the IT category (Task 1: "employees in the IT department")
select job_title, company_name, salary_max
  from public.jobs
 where category = 'IT';

-- ID of the Finance jobs (Task 1: "DeptID of the Finance department")
select id, job_title
  from public.jobs
 where category = 'Finance';


-- ============================================================
-- 2) GROUP BY: group rows that have the same value
-- GROUP BY puts rows with the same value into one group, so an
-- aggregate function (COUNT, SUM, AVG...) gives one result per group.
-- ============================================================

-- Number of jobs in each category (Task 1: "employees in each department")
select category, count(*) as total_jobs
  from public.jobs
 group by category;

-- Number of accounts per role
select role, count(*) as total_accounts
  from public.accounts
 group by role;


-- ============================================================
-- 3) HAVING: filter groups
--   WHERE  -> applied to each row BEFORE grouping
--   HAVING -> applied to each group AFTER grouping
-- ============================================================

-- Only categories that have 2 or more jobs
select category, count(*) as total_jobs
  from public.jobs
 group by category
having count(*) >= 2;

-- WHERE + GROUP BY + HAVING together:
-- among active jobs, companies whose average max salary is above 100,000
select company_name, avg(salary_max) as avg_max_salary
  from public.jobs
 where status = 'active'
 group by company_name
having avg(salary_max) > 100000;


-- ============================================================
-- 4) ORDER BY
-- ORDER BY sorts the final result; it can sort by an aggregate alias.
-- ============================================================

-- Jobs with the most applications first
select job_title, count(*) as total_applications
  from public.applications
 group by job_title
 order by total_applications desc;


-- ============================================================
-- 5) UNION / INTERSECT / MINUS
--   Both queries must return the same number and type of columns.
-- ============================================================

-- UNION: rows from both queries, duplicates removed
-- Job titles that are either posted in Karachi or have applications
select job_title from public.jobs where location = 'Karachi'
union
select job_title from public.applications;

-- INTERSECT: only rows found in both queries
-- Job seekers who applied to a job AND saved a job
select applicant_id from public.applications
intersect
select account_id from public.saved_jobs;

-- MINUS: rows in the first query but not in the second
-- Oracle: MINUS     PostgreSQL / SQL Server: EXCEPT
-- Jobs that nobody has applied to
select id from public.jobs
except
select job_id from public.applications;


-- ============================================================
-- 6) AGGREGATE FUNCTIONS
-- Aggregate functions take many rows and return ONE value:
-- COUNT = how many, SUM = total, AVG = average, MAX = largest, MIN = smallest.
-- ============================================================

-- COUNT: total job seekers (Task 2: "total number of patients")
select count(*) as total_job_seekers
  from public.accounts
 where role = 'job_seeker';

-- SUM: total openings across all jobs
select sum(openings) as total_openings from public.jobs;

-- AVG: average salaries (Task 2: "average weight and height")
select avg(salary_min) as avg_min_salary,
       avg(salary_max) as avg_max_salary
  from public.jobs;

-- MAX / MIN (Task 1: "maximum / minimum salary")
select max(salary_max) as highest_salary,
       min(salary_min) as lowest_salary
  from public.jobs;

-- Jobs with a salary above 100,000 (Task 1: "salary > 5000")
select job_title, salary_max
  from public.jobs
 where salary_max > 100000;


-- ============================================================
-- 7) DATE FUNCTIONS
-- Date functions give the current date, convert text <-> date,
-- and pull out parts of a date (year, month, day).
-- ============================================================

-- SYSDATE / CURRENT_DATE
-- Oracle:     SELECT SYSDATE FROM dual;
-- PostgreSQL: no dual table needed
select current_date;

-- TO_DATE: string -> date
select to_date('31-12-2026', 'DD-MM-YYYY');

-- Jobs whose deadline is before 31 Dec 2026
select job_title, deadline
  from public.jobs
 where deadline < to_date('2026-12-31', 'YYYY-MM-DD');

-- TO_CHAR: date -> formatted string
select job_title, to_char(created_at, 'DD-Mon-YYYY') as posted_on
  from public.jobs;

-- EXTRACT: one part of a date (year, month, day)
select full_name,
       extract(year  from created_at) as join_year,
       extract(month from created_at) as join_month,
       extract(day   from created_at) as join_day
  from public.accounts;


-- ============================================================
-- 8) STRING FUNCTIONS
-- String functions work on text: join, cut, measure length,
-- change case and remove spaces.
-- ============================================================

-- CONCAT: join strings
select concat(job_title, ' at ', company_name) as headline from public.jobs;

-- SUBSTR: part of a string -> first 3 letters of the name
select full_name, substr(full_name, 1, 3) as short_name from public.accounts;

-- LENGTH: number of characters
select job_title, length(job_title) as title_length from public.jobs;

-- UPPER / LOWER (Task 2: "patient names in uppercase")
select upper(full_name) as name_upper,
       lower(full_name) as name_lower
  from public.accounts
 where role = 'job_seeker';

-- TRIM: remove leading and trailing spaces
select trim('   Frontend Developer   ');


-- ============================================================
-- 9) MATHEMATICAL FUNCTIONS
-- Math functions round numbers and give the remainder of a division.
-- ============================================================

-- ROUND: average salary to 2 decimal places
select category, round(avg(salary_max), 2) as avg_salary
  from public.jobs
 group by category;

-- FLOOR / CEIL: next whole number down / up
select job_title,
       floor(salary_max / 1000.0) as salary_k_floor,
       ceil(salary_max / 1000.0)  as salary_k_ceil
  from public.jobs;

-- MOD: remainder -> jobs with an even number of views
select job_title, views, mod(views, 2) as remainder
  from public.jobs
 where mod(views, 2) = 0;


-- ============================================================
-- 10) Patients / Appointments task, project version
--     (applications play the role of appointments)
-- ============================================================

-- Total applications and the average score
select count(*) as total_applications, avg(applicant_score) as avg_score
  from public.applications;

-- Max and min score (Task 2: "maximum and minimum fees")
select max(applicant_score) as best_score, min(applicant_score) as worst_score
  from public.applications;

-- Applications with a score above 80 (Task 2: "fees > 200")
select name, job_title, applicant_score
  from public.applications
 where applicant_score > 80;

-- Applications per company (Task 2: "appointments per doctor")
select company_name, count(*) as total_applications
  from public.applications
 group by company_name;
