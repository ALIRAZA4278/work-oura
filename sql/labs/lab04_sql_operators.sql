-- ============================================================
-- lab04_sql_operators.sql  --  LAB 04: SQL OPERATORS
--
-- Topics covered:
--   1. Arithmetic operators:  +  -  *  /  ^ (power)  % (modulus)
--   2. Logical operators:     AND  OR  NOT
--   3. Comparison operators:  =  != / <>  >  <  >=  <=
--   4. Special operators:     BETWEEN, IS NULL, ALL, ANY, LIKE, IN, EXISTS
--   5. Set operators:         UNION, UNION ALL, INTERSECT,
--                             MINUS (PostgreSQL: EXCEPT)
--   6. Several operators in one query (the lab's combined tasks)
--
-- Depends on: lab00_demo_data.sql
-- SELECT queries only, no data is changed.
--
-- How to run in Supabase SQL Editor:
--   Highlight a query and click Run to see its result
--   (running the whole file only shows the LAST result).
-- ============================================================


-- ============================================================
-- 1) ARITHMETIC OPERATORS
-- Arithmetic operators do maths on numeric columns and return a
-- calculated column in the result.
-- ============================================================

-- (+) Addition: max salary + 15,000 bonus
select job_title, salary_max + 15000 as salary_with_bonus
  from public.jobs;

-- (-) Subtraction: size of the salary range
select job_title, salary_max - salary_min as salary_range
  from public.jobs;

-- (*) Multiplication: total salary budget of a job (openings x salary)
select job_title, openings * salary_max as monthly_budget
  from public.jobs;

-- (/) Division: middle of the salary range
-- integer / integer = integer, so divide by 2.0 to keep decimals
select job_title, (salary_min + salary_max) / 2.0 as mid_salary
  from public.jobs;

-- (^) Power: views squared
-- (in SQL Server ^ means XOR; in PostgreSQL it means power)
select job_title, views ^ 2 as views_squared
  from public.jobs;

-- (%) Modulus: jobs whose min salary is not divisible by 5,000
select job_title, salary_min
  from public.jobs
 where salary_min % 5000 <> 0;


-- ============================================================
-- 2) LOGICAL OPERATORS
-- Logical operators combine conditions in WHERE. AND runs before OR,
-- so use brackets to control the order.
-- ============================================================

-- AND: IT category AND salary > 100,000
select job_title, category, salary_max
  from public.jobs
 where category = 'IT' and salary_max > 100000;

-- OR: IT category OR fewer than 50 views
select job_title, category, views
  from public.jobs
 where category = 'IT' or views < 50;

-- NOT: everything except HR
select job_title, category
  from public.jobs
 where not category = 'HR';

-- Brackets (Task 2): AND runs before OR.
-- Without brackets this returns "IT jobs in Karachi" + "every Lahore job"
select job_title, category, location
  from public.jobs
 where location = 'Lahore' or location = 'Karachi' and category = 'IT';

-- With brackets: only IT jobs that are in Lahore or Karachi
select job_title, category, location
  from public.jobs
 where (location = 'Lahore' or location = 'Karachi') and category = 'IT';


-- ============================================================
-- 3) COMPARISON OPERATORS
-- Comparison operators compare two values and return true / false.
-- ============================================================

-- (=) equal
select job_title, salary_max from public.jobs where salary_max = 120000;

-- (!=) and (<>) both mean "not equal"
select job_title, category from public.jobs where category != 'Design';
select job_title, category from public.jobs where category <> 'Design';

-- (>) greater than
select job_title, views from public.jobs where views > 100;

-- (<) less than
select job_title, salary_min from public.jobs where salary_min < 60000;

-- (>=) greater than or equal
select job_title, openings from public.jobs where openings >= 2;

-- (<=) less than or equal
select job_title, salary_max from public.jobs where salary_max <= 90000;


-- ============================================================
-- 4) SPECIAL OPERATORS
-- Special operators give extra ways to filter: ranges (BETWEEN),
-- missing values (IS NULL), patterns (LIKE), lists (IN) and
-- comparisons with a subquery result (ALL, ANY, EXISTS).
-- ============================================================

-- BETWEEN: inside a range (both ends included)
select job_title, salary_max from public.jobs where salary_max between 70000 and 150000;

-- NOT BETWEEN: outside the range
select job_title, salary_max from public.jobs where salary_max not between 70000 and 150000;

-- IS NULL: missing value (applications that have no score yet)
select name, job_title from public.applications where applicant_score is null;

-- LIKE: names that start with "A"
select full_name from public.accounts where full_name like 'A%';

-- IN: any value from a list
select job_title, category from public.jobs where category in ('IT', 'Finance');

-- NOT IN: none of the values in the list
select job_title, category from public.jobs where category not in ('IT', 'Finance');

-- ALL: compared with every value. Jobs paying more than EVERY Finance job
select job_title, salary_max
  from public.jobs
 where salary_max > all (select salary_max from public.jobs where category = 'Finance');

-- ANY: true if it matches at least one value. IT jobs paying more
-- than ANY Finance job
select job_title, salary_max
  from public.jobs
 where category = 'IT'
   and salary_max > any (select salary_max from public.jobs where category = 'Finance');

-- EXISTS: jobs that have at least one application
select job_title
  from public.jobs j
 where exists (select * from public.applications a where a.job_id = j.id);

-- NOT EXISTS: jobs that have never been applied to
select job_title
  from public.jobs j
 where not exists (select * from public.applications a where a.job_id = j.id);

-- NOT IN (Airline task): job seekers who never applied anywhere
select full_name
  from public.accounts
 where role = 'job_seeker'
   and id not in (select applicant_id from public.applications);


-- ============================================================
-- 5) SET OPERATORS
-- Set operators combine the results of two SELECT queries into one.
-- Both queries must return the same number and type of columns.
-- ============================================================

-- UNION: cities of IT and Finance jobs, duplicates removed
select location from public.jobs where category = 'IT'
union
select location from public.jobs where category = 'Finance';

-- UNION ALL: same query, but duplicates are kept
select location from public.jobs where category = 'IT'
union all
select location from public.jobs where category = 'Finance';

-- INTERSECT: cities that have both IT and Finance jobs
select location from public.jobs where category = 'IT'
intersect
select location from public.jobs where category = 'Finance';

-- MINUS / EXCEPT: cities with IT jobs but no Finance jobs
select location from public.jobs where category = 'IT'
except
select location from public.jobs where category = 'Finance';

-- Bookstore task: jobs that are active or have been applied to
select job_title from public.jobs where status = 'active'
union
select job_title from public.applications;


-- ============================================================
-- 6) SEVERAL OPERATORS TOGETHER (the lab's combined tasks)
-- ============================================================

-- Logical: IT jobs that are Senior or pay more than 100,000
select job_title, experience_level, salary_max
  from public.jobs
 where category = 'IT'
   and (experience_level = 'Senior' or salary_max > 100000);

-- Comparison: jobs cheaper than 60,000 or more than 200,000
select job_title, salary_max
  from public.jobs
 where salary_max < 60000 or salary_max > 200000;

-- Special: salary between 50k and 130k AND category Finance or HR
select job_title, category, salary_max
  from public.jobs
 where salary_max between 50000 and 130000
   and category in ('Finance', 'HR');

-- Arithmetic + BETWEEN: average views of jobs paying 50k to 150k
select avg(views) as avg_views
  from public.jobs
 where salary_max between 50000 and 150000;

-- Arithmetic + comparison (Airline task: "percentage of seats booked"):
-- percentage of each job's openings that already have an application
select job_title,
       openings,
       (select count(*) from public.applications a where a.job_id = j.id) * 100.0 / openings as percent_filled
  from public.jobs j
 where openings > 0;
