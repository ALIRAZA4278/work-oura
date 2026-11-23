-- ============================================================
-- ALL_IN_ONE.sql  --  all 9 DBMS lab files in one place, in the right order
--
-- Paste it into Supabase Dashboard -> SQL Editor and Run once.
-- It is a copy of the 9 files in labs/. The project schema
-- (sql/schema.sql) must already exist in the database.
-- Supabase only shows the LAST result; to see one query's result,
-- highlight that query and click Run.
--
-- DBMS LAB QUERIES (labs/lab00 .. lab09)
--   Every query runs on this project's tables and has a comment
--   explaining what it does. DDL / UPDATE / DELETE practice runs in
--   the "lab" schema, so the app's data is not changed.
--   (No Lab 05 manual was provided, so there is no lab05 file.)
--
--   lab00  Demo data: accounts, jobs, applications, saved jobs
--   lab01  CREATE DATABASE / USE, data types,
--          DDL: CREATE, ALTER (ADD / DROP / MODIFY / RENAME COLUMN),
--          RENAME, TRUNCATE, DROP,
--          constraints: NOT NULL, UNIQUE, CHECK, PRIMARY KEY,
--          FOREIGN KEY, DEFAULT, ADD / DROP constraint with ALTER
--   lab02  DML: INSERT, UPDATE, DELETE, SELECT, TRUNCATE vs DELETE,
--          DISTINCT, COUNT, TOP (LIMIT), AS, IN, BETWEEN, ORDER BY,
--          LIKE, IS NULL, AND / OR / NOT, rename column / table
--   lab03  DRL: WHERE, GROUP BY, HAVING, ORDER BY,
--          UNION, INTERSECT, MINUS (EXCEPT),
--          aggregate: COUNT, SUM, AVG, MAX, MIN,
--          date: CURRENT_DATE / SYSDATE, TO_DATE, TO_CHAR, EXTRACT,
--          string: CONCAT, SUBSTR, LENGTH, UPPER, LOWER, TRIM,
--          math: ROUND, FLOOR, CEIL, MOD
--   lab04  Operators: arithmetic (+ - * / ^ %), logical (AND OR NOT),
--          comparison (= != <> > < >= <=), special (BETWEEN, IS NULL,
--          ALL, ANY, LIKE, IN, EXISTS), set (UNION, UNION ALL,
--          INTERSECT, EXCEPT)
--   lab06  ER model: strong / weak entities, attribute types,
--          relationships + cardinality, ER schema
--   lab07  Joins: INNER, LEFT, RIGHT, FULL OUTER, CROSS, SELF
--   lab08  Subqueries: single-row, multi-row (IN, ANY, ALL, EXISTS),
--          correlated, nested, in FROM / SELECT / HAVING, with JOIN,
--          with INSERT / UPDATE / DELETE
--   lab09  Indexes (CREATE / UNIQUE / composite / DROP INDEX) and
--          Views (CREATE / OR REPLACE / JOIN view / DROP VIEW)
--
-- ============================================================

-- >>>>>>>>>>>>>>>>>>>>  labs/lab00_demo_data.sql  <<<<<<<<<<<<<<<<<<<<

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


-- >>>>>>>>>>>>>>>>>>>>  labs/lab01_ddl_constraints.sql  <<<<<<<<<<<<<<<<<<<<

-- ============================================================
-- lab01_ddl_constraints.sql  --  LAB 01: DATABASE INSTALLATION AND DDL
--
-- Topics covered:
--   * Creating and selecting a database (CREATE DATABASE, USE)
--   * Data types (CHAR, VARCHAR, INT, INTEGER, DECIMAL, FLOAT,
--     BOOLEAN, DATE, TIMESTAMP, LONG/CLOB, RAW/BLOB)
--   * DDL: CREATE, ALTER (ADD / DROP / MODIFY / RENAME COLUMN),
--     RENAME, TRUNCATE, DROP
--   * Constraints: NOT NULL, UNIQUE, CHECK, PRIMARY KEY,
--     FOREIGN KEY, DEFAULT
--   * Adding / dropping constraints with ALTER TABLE
--
-- Database: Supabase = PostgreSQL. The lab manual uses Oracle /
-- MySQL syntax; where PostgreSQL differs, a comment shows both.
--
-- Depends on: lab00_demo_data.sql
-- All DDL runs in the "lab" schema -> the app's tables are not touched.
--
-- How to run in Supabase SQL Editor:
--   1. Run the whole file once (it only shows the LAST result).
--   2. To see any single query's result, highlight it and click Run.
-- ============================================================


-- ============================================================
-- 1) DATABASE
-- A database stores data in an organised way. A schema is a named
-- group of tables inside a database. USE / search_path tells SQL
-- which one to work in.
-- ============================================================

-- MySQL:  CREATE DATABASE jobboard;  USE jobboard;
-- Supabase already gives us a database, so we create a SCHEMA
-- inside it (a folder of tables).
create schema if not exists lab;

-- PostgreSQL equivalent of USE: set the search_path
set search_path to lab, public;

-- Back to the default (the rest of the file uses full names: lab.xyz)
set search_path to public;


-- ============================================================
-- 2) DATA TYPES
-- One column per data type. The comment shows the Oracle / MySQL name.
-- A data type decides what kind of value a column can hold (text,
-- number, date, true/false, binary) and how much space it takes.
-- ============================================================
drop table if exists lab.datatype_demo;

create table lab.datatype_demo (
  code         char(5),             -- CHAR(size): fixed length
  title        varchar(100),        -- VARCHAR(size): variable length, max 100 characters
  openings     int,                 -- INT: whole number
  views        integer,             -- INTEGER: whole number (-2^31 .. 2^31-1)
  salary       decimal(10, 2),      -- DECIMAL(p,s): 10 digits in total, 2 after the decimal point
  rating       float,               -- FLOAT: floating-point number
  is_remote    boolean,             -- BOOLEAN: true / false
  deadline     date,                -- DATE: date only
  posted_at    timestamp,           -- TIMESTAMP: date + time with fractional seconds
  description  text,                -- equivalent of LONG / CLOB: very long text
  logo         bytea                -- equivalent of RAW / BLOB: binary data (images etc.)
);

insert into lab.datatype_demo
values ('PK', 'Frontend Developer', 2, 120, 95000.50, 4.5, true,
        '2026-12-31', '2026-10-17 10:30:15.123', 'A long job description...', '\x89504e47');

select * from lab.datatype_demo;


-- ============================================================
-- 3) CREATE + ALTER  (like Lab Task 2: DEPARTMENT -> JOB_CATEGORY)
-- In the project, jobs.category is a text column. Here we give it
-- its own table to practise DDL.
-- DDL (Data Definition Language) defines the STRUCTURE of the database.
-- CREATE makes a new table; ALTER changes an existing table
-- (add, modify, rename or drop a column) without losing its data.
-- ============================================================
drop table if exists lab.job_interview;
drop table if exists lab.category_master;
drop table if exists lab.job_category;

-- CREATE TABLE
create table lab.job_category (
  category_id   int primary key,            -- PRIMARY KEY
  category_name varchar(30) not null        -- NOT NULL
);

-- ALTER TABLE ... ADD: new column
alter table lab.job_category add location varchar(50);

-- ALTER TABLE ... MODIFY: change the data type
-- Oracle: ALTER TABLE job_category MODIFY (category_name varchar2(50));
-- PostgreSQL:
alter table lab.job_category alter column category_name type varchar(50);

-- ALTER TABLE ... RENAME COLUMN
alter table lab.job_category rename column category_name to department_name;

-- ALTER TABLE ... DROP COLUMN
alter table lab.job_category drop column location;


-- ============================================================
-- 4) Like Lab Task 4: insert rows, add a column, fill it,
--    then select with a condition
-- Shows that ALTER TABLE ... ADD works on a table that already
-- has data: the new column starts as NULL and is filled with UPDATE.
-- ============================================================

-- The project's job categories
insert into lab.job_category (category_id, department_name)
values (1, 'IT'), (2, 'Finance'), (3, 'Design'), (4, 'HR'), (5, 'Sales');

-- New column: the year this category started
alter table lab.job_category add column started_year int;

update lab.job_category set started_year = 2008 where category_id = 1;
update lab.job_category set started_year = 2012 where category_id = 2;
update lab.job_category set started_year = 2015 where category_id = 3;
update lab.job_category set started_year = 2005 where category_id = 4;
update lab.job_category set started_year = 2020 where category_id = 5;

-- Categories started after 2010
select * from lab.job_category where started_year > 2010;


-- ============================================================
-- 5) ALL CONSTRAINTS IN ONE TABLE  (like Lab Task 3: a table with a FK)
-- job_interview: the interview for an application.
-- It references the project's public.applications table with a
-- FOREIGN KEY.
-- Constraints are rules on columns that keep the data valid:
--   NOT NULL    -> value is required
--   UNIQUE      -> no duplicates
--   CHECK       -> value must pass a condition
--   PRIMARY KEY -> unique + not null, identifies each row
--   FOREIGN KEY -> value must exist in another table's primary key
--   DEFAULT     -> value used when none is given
-- ============================================================
create table lab.job_interview (
  interview_id   int          primary key,                            -- PRIMARY KEY: unique + not null
  application_id uuid         not null,                               -- NOT NULL: cannot be empty
  interviewer    varchar(50)  not null,
  meeting_link   varchar(200) unique,                                 -- UNIQUE: no two rows with the same value
  mode           varchar(10)  default 'online',                       -- DEFAULT: 'online' when no value is given
  score          int,
  hire_date      date,
  check (score between 0 and 10),                                     -- CHECK: score must be 0 to 10
  foreign key (application_id) references public.applications (id)   -- FOREIGN KEY
);

-- Task 3: change hire_date from DATE to TIMESTAMP, rename a column, drop a column
alter table lab.job_interview alter column hire_date type timestamp;
alter table lab.job_interview rename column interviewer to interviewer_name;
alter table lab.job_interview drop column hire_date;

-- One row: the interview for Ali Raza's Frontend Developer application
insert into lab.job_interview (interview_id, application_id, interviewer_name, meeting_link, score)
select 1, id, 'Ahmed Khan', 'https://meet.example.com/abc', 8
  from public.applications
 where email = 'ali.raza@demo.pk'
   and job_title = 'Frontend Developer';

-- mode was not given -> DEFAULT 'online' was used
select * from lab.job_interview;


-- ============================================================
-- 6) ADD / DROP CONSTRAINTS WITH ALTER TABLE
-- Constraints can also be added to or removed from a table that
-- already exists, using ALTER TABLE ... ADD / DROP CONSTRAINT.
-- ============================================================

-- A table without a primary key
create table lab.category_master (
  code  int,
  name  varchar(30)
);

-- ADD PRIMARY KEY
alter table lab.category_master add primary key (code);

-- ADD CONSTRAINT ... FOREIGN KEY
alter table lab.category_master
  add constraint fk_category_master_category
  foreign key (code) references lab.job_category (category_id);

-- DROP CONSTRAINT (by name)
alter table lab.category_master drop constraint fk_category_master_category;

-- DROP PRIMARY KEY
-- MySQL: ALTER TABLE category_master DROP PRIMARY KEY;
-- In PostgreSQL the primary key has a name: <table>_pkey
alter table lab.category_master drop constraint category_master_pkey;


-- ============================================================
-- 7) RENAME, TRUNCATE, DROP
-- These run on their own throwaway tables, so every table used
-- by the queries above still exists after the file has run.
-- RENAME changes a table's name, TRUNCATE deletes all rows but keeps
-- the table, DROP deletes the whole table (structure + data).
-- ============================================================
drop table if exists lab.old_jobs;
drop table if exists lab.archived_jobs;
drop table if exists lab.drop_demo;

create table lab.old_jobs (
  job_no    int primary key,
  job_title varchar(100)
);

insert into lab.old_jobs values (1, 'Frontend Developer'), (2, 'Data Analyst');

-- NOTE: after a run, the Supabase SQL Editor looks up every table the
-- script created, by the name it was created with. If that table was
-- renamed or dropped, the editor shows "relation ... does not exist".
-- So every table below ends up with its original name again.

-- RENAME TABLE
-- MySQL: RENAME TABLE old_jobs TO archived_jobs
alter table lab.old_jobs rename to archived_jobs;

-- Rename it back to its original name
alter table lab.archived_jobs rename to old_jobs;

-- TRUNCATE: deletes all rows, the structure stays
truncate table lab.old_jobs;
select * from lab.old_jobs;   -- empty, but the columns are still there

-- DROP TABLE: removes the table itself (structure + data)
create table lab.drop_demo (id int);
drop table lab.drop_demo;

-- Create it again (empty) so the Supabase editor can find it (see NOTE above)
create table lab.drop_demo (id int);

-- Equivalent of DROP DATABASE: drop the whole schema with its tables.
-- This also deletes the practice tables of the other lab files, so
-- it is commented out. Run it only to clean up after all labs:
-- drop schema lab cascade;


-- >>>>>>>>>>>>>>>>>>>>  labs/lab02_dml_operators.sql  <<<<<<<<<<<<<<<<<<<<

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


-- >>>>>>>>>>>>>>>>>>>>  labs/lab03_drl_functions.sql  <<<<<<<<<<<<<<<<<<<<

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


-- >>>>>>>>>>>>>>>>>>>>  labs/lab04_sql_operators.sql  <<<<<<<<<<<<<<<<<<<<

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


-- >>>>>>>>>>>>>>>>>>>>  labs/lab06_er_model.sql  <<<<<<<<<<<<<<<<<<<<

-- ============================================================
-- lab06_er_model.sql  --  LAB 06: CONSTRUCTING ER DIAGRAMS AND ER SCHEMAS
--
-- Topics covered:
--   * ER model components: entity, entity set, strong / weak entity
--   * Attribute types: key (primary key), composite, multivalued,
--     derived, foreign key
--   * Relationships and their cardinality
--   * The schema of the database (SSMS "Database Diagram" /
--     sys.tables equivalent)
--
-- Depends on: lab00_demo_data.sql
-- SELECT query only, no data is changed.
-- ============================================================


-- ============================================================
-- 1) ER DIAGRAM OF THE JOB BOARD (text form)
--
--   [ ]   = strong entity          [[ ]] = weak entity
--   < >   = relationship           ( )   = attribute
--   (_x_) = key attribute          {x}   = multivalued attribute
--   /x/   = derived attribute
--
--                (_id_) (email) (full_name) (role)
--                               |
--      +-------1-----------[ ACCOUNT ]-----------1-------+
--      |                     |       |                   |
--    <has>                <posts>  <applies_to>        <has>
--      |                     |1      |M                  |
--      1                     |       |                   1
--  [[ PROFILE ]]             N       N           [[ USER_SETTINGS ]]
--  {skills}                  |       |
--                       [   JOB   ]--+
--   (_id_) (job_title) {required_skills} /total_applications/
--                          N |
--                      <offers>
--                          1 |
--                     [ COMPANY ]  (_id_) (name) (location)
--
--   ACCOUNT  M --<saves>-- N  JOB      (saved_jobs table)
--
--
-- 2) ENTITIES
--   Entity     : an object with its own existence, e.g. one job, one account.
--   Entity set : all entities of one type, e.g. all rows of the jobs table.
--   Strong entity (has its own primary key, single rectangle):
--     accounts, companies, jobs
--   Weak entity (cannot be identified without its owner, double rectangle):
--     profiles, user_settings -> their primary key is account_id,
--     which is the owner's key.
--
--
-- 3) ATTRIBUTES AND THEIR TYPES
--   Entity        Attribute          Data type     Attribute type
--   ACCOUNT       id                 uuid          Primary Key, Key Attribute
--                 full_name          text          Composite (first name + last name)
--                 email              text          Simple
--   PROFILE       account_id         uuid          Primary Key, Foreign Key
--                 skills             text[]        Multivalued
--   COMPANY       id                 uuid          Primary Key, Key Attribute
--                 location           text          Composite (city + country)
--   JOB           id                 uuid          Primary Key, Key Attribute
--                 recruiter_id       uuid          Foreign Key -> accounts
--                 company_id         uuid          Foreign Key -> companies
--                 required_skills    text[]        Multivalued
--                 total_applications (view)        Derived (counted from applications)
--   APPLICATION   id                 uuid          Primary Key, Key Attribute
--                 job_id             uuid          Foreign Key -> jobs
--                 applicant_id       uuid          Foreign Key -> accounts
--   SAVED_JOBS    (account_id, job_id)             Primary Key (composite), Foreign Keys
--
--
-- 4) RELATIONSHIPS
--   Relationship              Entities involved          Cardinality
--   Account has Profile       ACCOUNT, PROFILE           One-to-One
--   Account has Settings      ACCOUNT, USER_SETTINGS     One-to-One
--   Recruiter posts Jobs      ACCOUNT, JOB               One-to-Many
--   Company offers Jobs       COMPANY, JOB               One-to-Many
--   Account owns Companies    ACCOUNT, COMPANY           One-to-Many
--   Seeker applies to Jobs    ACCOUNT, JOB               Many-to-Many (applications)
--   Seeker saves Jobs         ACCOUNT, JOB               Many-to-Many (saved_jobs)
--
--
-- 5) ER SCHEMA
--   The tables for this ER diagram are created in sql/01 ... sql/08.
--   Supabase shows the diagram under Database -> Schema Visualizer
--   (same as SSMS -> Database Diagrams -> New Database Diagram).
-- ============================================================


-- Show all tables in the current database
-- SQL Server: SELECT * FROM sys.tables;
select *
  from information_schema.tables
 where table_schema = 'public';


-- >>>>>>>>>>>>>>>>>>>>  labs/lab07_joins.sql  <<<<<<<<<<<<<<<<<<<<

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


-- >>>>>>>>>>>>>>>>>>>>  labs/lab08_subqueries.sql  <<<<<<<<<<<<<<<<<<<<

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


-- >>>>>>>>>>>>>>>>>>>>  labs/lab09_indexes_views.sql  <<<<<<<<<<<<<<<<<<<<

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
