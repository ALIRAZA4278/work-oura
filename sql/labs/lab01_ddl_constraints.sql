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
