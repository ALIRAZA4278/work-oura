-- ============================================================
-- lab08_subqueries.sql  --  LAB 08: SQL SUBQUERIES
--
-- A subquery (inner / nested query) is a query written inside
-- another query. The outer query uses the result of the inner query.
-- Subqueries can appear in SELECT, FROM, WHERE, HAVING, and in
-- INSERT, UPDATE and DELETE statements.
--
-- Topics covered:
--   1. Single-row subquery
--   2. Multi-row subquery (IN, ANY, ALL, EXISTS)
--   3. Correlated subquery
--   4. Nested subquery
--   5. Subquery in WHERE, FROM, SELECT, HAVING
--   6. Subquery with INSERT, UPDATE, DELETE
--   7. Subquery with JOIN
--
-- Depends on: lab00_demo_data.sql
-- SELECT queries read the project's public tables. INSERT / UPDATE /
-- DELETE run on "lab" tables so the app's data stays safe.
--
-- How to run in Supabase SQL Editor:
--   1. Run the whole file once (it only shows the LAST result).
--   2. To see any single query's result, highlight it and click Run.
-- ============================================================


-- ============================================================
-- 1) SINGLE-ROW SUBQUERY
-- The inner query returns exactly ONE value (one row, one column).
-- Used with =, <, >, <=, >=, <>.
-- If it returns more than one row, SQL gives an error.
-- ============================================================

-- Jobs that pay more than the average salary
select job_title, salary_max
  from public.jobs
 where salary_max > (select avg(salary_max) from public.jobs);

-- The job(s) with the highest salary
select job_title, salary_max
  from public.jobs
 where salary_max = (select max(salary_max) from public.jobs);

-- Task 1: the applicant with the first (earliest) application
select name, job_title, applied_at
  from public.applications
 where applied_at = (select min(applied_at) from public.applications);


-- ============================================================
-- 2) MULTI-ROW SUBQUERY
-- The inner query returns MANY rows. Used with IN, ANY, ALL, EXISTS
-- to compare a value with a list of results.
-- ============================================================

-- IN: jobs that Ali Raza or Ayesha Noor applied to
select job_title, company_name
  from public.jobs
 where id in (select job_id
                from public.applications
               where name in ('Ali Raza', 'Ayesha Noor'));

-- ANY: jobs paying more than at least one Finance job
select job_title, salary_max
  from public.jobs
 where salary_max > any (select salary_max from public.jobs where category = 'Finance');

-- ALL: jobs paying more than every Finance job
select job_title, salary_max
  from public.jobs
 where salary_max > all (select salary_max from public.jobs where category = 'Finance');

-- EXISTS: companies that have at least one job
select name
  from public.companies c
 where exists (select * from public.jobs j where j.company_id = c.id);

-- Task 1: jobs with applications from more than one person
select job_title
  from public.jobs
 where id in (select job_id
                from public.applications
               group by job_id
              having count(*) > 1);

-- Task 3: jobs located in any city that also has a Finance job
select job_title, location
  from public.jobs
 where location = any (select location from public.jobs where category = 'Finance');


-- ============================================================
-- 3) CORRELATED SUBQUERY
-- The inner query uses a column of the outer query, so it runs
-- once for EVERY row of the outer query. Useful for comparing a
-- row with its own group (e.g. its own category).
-- ============================================================

-- Jobs that pay more than the average of THEIR OWN category
select j1.job_title, j1.category, j1.salary_max
  from public.jobs j1
 where j1.salary_max > (select avg(j2.salary_max)
                          from public.jobs j2
                         where j2.category = j1.category);

-- The highest paid job in each category
select j1.category, j1.job_title, j1.salary_max
  from public.jobs j1
 where j1.salary_max = (select max(j2.salary_max)
                          from public.jobs j2
                         where j2.category = j1.category);

-- Task 1: applicants whose score is above the average score of the same job
select a1.name, a1.job_title, a1.applicant_score
  from public.applications a1
 where a1.applicant_score > (select avg(a2.applicant_score)
                               from public.applications a2
                              where a2.job_id = a1.job_id);


-- ============================================================
-- 4) NESTED SUBQUERY
-- A subquery inside another subquery. The innermost one runs
-- first and feeds the next one, like layers of filtering.
-- ============================================================

-- All jobs in the category of the most viewed job
select job_title, category
  from public.jobs
 where category = (select category
                     from public.jobs
                    where views = (select max(views) from public.jobs));

-- Task 1 / 2: the job with the second highest salary
select job_title, salary_max
  from public.jobs
 where salary_max = (select max(salary_max)
                       from public.jobs
                      where salary_max < (select max(salary_max) from public.jobs));


-- ============================================================
-- 5) SUBQUERY IN FROM, SELECT AND HAVING
--   FROM   -> the subquery acts as a temporary (derived) table
--   SELECT -> the subquery returns one value for each row
--   HAVING -> the subquery gives a value to compare groups with
-- ============================================================

-- FROM: first a temporary table of Karachi jobs, then select from it
select job_title, salary_max
  from (select job_title, salary_max, location
          from public.jobs
         where location like 'K%') as temp_table;

-- SELECT: each job together with its number of applications
select job_title,
       (select count(*) from public.applications a where a.job_id = j.id) as applications
  from public.jobs j;

-- HAVING (Task 3): recruiters who posted more jobs than the average recruiter
select recruiter_id, count(*) as jobs_posted
  from public.jobs
 group by recruiter_id
having count(*) > (select avg(total)
                     from (select count(*) as total
                             from public.jobs
                            group by recruiter_id) as per_recruiter);


-- ============================================================
-- 6) SUBQUERY WITH JOIN
-- A subquery is used as a table inside a JOIN.
-- ============================================================

-- Seekers joined with only their "interview" applications
select a.full_name, i.job_title
  from public.accounts a
 inner join (select applicant_id, job_title
               from public.applications
              where status = 'interview') i
    on i.applicant_id = a.id;


-- ============================================================
-- 7) SUBQUERY WITH INSERT, UPDATE, DELETE
-- The subquery decides which rows are inserted, updated or deleted.
-- These run on "lab" tables so the app's data stays safe.
-- ============================================================
drop table if exists lab.shortlist;
drop table if exists lab.job_copy;

create table lab.shortlist (
  applicant_name text,
  job_title      text,
  score          int
);

create table lab.job_copy (
  job_title    text,
  company_name text,
  category     text,
  salary_max   int,
  views        int
);

-- INSERT with a subquery: copy all jobs into lab.job_copy
-- (like INSERT INTO Employee SELECT * FROM Temp_Employee)
insert into lab.job_copy
select job_title, company_name, category, salary_max, views
  from public.jobs;

-- INSERT with a subquery: shortlist applicants scoring above average
insert into lab.shortlist
select name, job_title, applicant_score
  from public.applications
 where applicant_score > (select avg(applicant_score) from public.applications);

-- Task 1 / 2: add a new entry for the applicant with the highest score
insert into lab.shortlist
select name, 'Final Round', applicant_score
  from public.applications
 where applicant_score = (select max(applicant_score) from public.applications);

select * from lab.shortlist;

-- UPDATE with a subquery: raise salaries that are below the average by 10%
update lab.job_copy
   set salary_max = salary_max * 1.10
 where salary_max < (select avg(salary_max) from public.jobs);

-- UPDATE with a subquery: rename jobs that nobody applied to
update lab.job_copy
   set job_title = 'No applicants'
 where job_title not in (select job_title from public.applications);

-- DELETE with a subquery: delete the job with the fewest views
delete from lab.job_copy
 where views = (select min(views) from lab.job_copy);

-- DELETE with a subquery: delete the jobs of Fintech companies
delete from lab.job_copy
 where company_name in (select name from public.companies where industry = 'Fintech');

select * from lab.job_copy;
