# Viva Notes: ALL_IN_ONE.sql (DBMS Labs)

**Project:** Job Board website (Next.js + Supabase).
**Database:** PostgreSQL (Supabase).
**File:** `sql/ALL_IN_ONE.sql` = 9 lab files in one place (lab00 → lab09). The project schema is in `sql/schema.sql`.

---

## 1. Total tables / objects

### Project tables: `public` schema (10 tables + 1 view)

| # | Table | What it stores |
|---|-------|----------------|
| 1 | `accounts` | Users (email, password hash, name, role: job_seeker / recruiter / admin) |
| 2 | `sessions` | Login sessions (token hash, expiry) |
| 3 | `password_reset_tokens` | "Forgot password" tokens |
| 4 | `email_verification_tokens` | Email verify tokens |
| 5 | `profiles` | Extra user info (skills, bio, resume): 1:1 with accounts |
| 6 | `user_settings` | Dashboard settings toggles: 1:1 with accounts |
| 7 | `companies` | Companies (name, industry, location) |
| 8 | `jobs` | Job posts (title, salary, category, status, views) |
| 9 | `applications` | Which seeker applied to which job (status, score) |
| 10 | `saved_jobs` | Bookmarked jobs (account + job) |
| View | `job_application_counts` | Applications per job (recruiter dashboard) |

The schema also has **5 functions**, **8 triggers**, **2 RLS policies** and **35 indexes**.

### Practice tables: `lab` schema (11 tables + 3 views)

| Lab | Tables / views created |
|-----|------------------------|
| lab01 | `datatype_demo`, `job_category`, `job_interview`, `category_master`, `old_jobs`, `drop_demo` |
| lab02 | `job_practice`, `job_archive` |
| lab08 | `shortlist`, `job_copy` |
| lab09 | `job_search` (+ 4 indexes), views `active_jobs`, `company_application_stats`, `drop_demo_view` |

**Why the `lab` schema?** All practice queries (CREATE / ALTER / UPDATE / DELETE / DROP) run here, so the app's real data in `public` is never touched.

**Demo data (lab00):**

- 5 companies
- 9 accounts (3 recruiters, 5 seekers, 1 admin)
- 8 jobs
- 9 applications
- 5 saved jobs

---

## 2. Basic terms

| Term | Meaning |
|------|---------|
| **Database** | Organised collection of data. DBMS = software that manages it (PostgreSQL). |
| **RDBMS** | Data in tables (rows + columns), tables linked by keys. |
| **Schema** | A folder / namespace of tables inside a database (`public`, `lab`). Also means "structure of a table". |
| **Table** | Rows (records) + columns (fields). |
| **SQL** | Language to talk to the database (CRUD = Create, Read, Update, Delete). |
| **DDL** | Data Definition: CREATE, ALTER, DROP, RENAME, TRUNCATE (structure). |
| **DML** | Data Manipulation: INSERT, UPDATE, DELETE (data). |
| **DRL / DQL** | Data Retrieval: SELECT. |
| **DCL** | Data Control: GRANT, REVOKE (permissions). |
| **TCL** | Transaction Control: BEGIN, COMMIT, ROLLBACK. |

---

## 3. Lab-wise topics

### Lab 00: Demo data

- Inserts sample rows so every query shows a result.
- Some values are NULL on purpose (deadline, openings, company) so that IS NULL and OUTER JOINs show the difference.
- **`ON CONFLICT DO NOTHING`:** if the row already exists (same id / unique value), skip it instead of giving an error. So the file can be run again without duplicates.

### Lab 01: DDL + constraints

| Command | What it does |
|---------|--------------|
| `CREATE SCHEMA / CREATE TABLE` | Makes a new schema / table |
| `SET search_path` | PostgreSQL version of `USE database` |
| `ALTER TABLE ... ADD` | Adds a column |
| `ALTER TABLE ... DROP COLUMN` | Removes a column |
| `ALTER COLUMN ... TYPE` | Changes the data type (Oracle: `MODIFY`) |
| `RENAME COLUMN` / `RENAME TO` | Renames a column / table |
| `TRUNCATE` | Deletes all rows, keeps the table |
| `DROP TABLE` | Deletes the whole table |
| `DROP SCHEMA ... CASCADE` | Like DROP DATABASE (deletes everything inside) |

**Data types:**

| Type | What it holds |
|------|---------------|
| `CHAR(n)` | Fixed-length text |
| `VARCHAR(n)` | Variable-length text |
| `TEXT` | Long text (like CLOB / LONG) |
| `INT` / `INTEGER` | Whole number |
| `DECIMAL(p,s)` | Exact decimal |
| `FLOAT` | Approximate decimal |
| `BOOLEAN` | true / false |
| `DATE` | Date only |
| `TIMESTAMP` | Date + time |
| `BYTEA` | Binary data (like BLOB / RAW) |
| `UUID` | Unique random id |
| `TEXT[]` | Array (multivalued) |
| `JSONB` | JSON data |

**Constraints** (rules that keep the data valid):

| Constraint | Rule |
|------------|------|
| `NOT NULL` | Value is required |
| `UNIQUE` | No duplicate values |
| `CHECK` | Value must pass a condition (e.g. score between 0 and 10) |
| `PRIMARY KEY` | Unique + not null; identifies each row; one per table |
| `FOREIGN KEY ... REFERENCES` | Value must exist in another table's primary key (links tables) |
| `DEFAULT` | Value used when none is given |
| `ON DELETE CASCADE` | Parent deleted → child rows deleted too |
| `ON DELETE SET NULL` | Parent deleted → child's FK becomes NULL |

`ALTER TABLE ... ADD CONSTRAINT` / `DROP CONSTRAINT` adds or removes a constraint on an existing table.

### Lab 02: DML + basic operators

| Keyword | What it does |
|---------|--------------|
| `INSERT INTO ... VALUES` | Adds rows |
| `UPDATE ... SET ... WHERE` | Changes rows (without WHERE, every row changes!) |
| `DELETE FROM ... WHERE` | Removes rows |
| `SELECT * / columns` | Reads data |
| `WHERE` | Filters rows |
| `DISTINCT` | Removes duplicates |
| `COUNT()` | Counts rows |
| `LIMIT` | First N rows (SQL Server: `TOP`) |
| `AS` | Alias (temporary name for a column / table) |
| `IN (...)` | Value is in a list |
| `BETWEEN a AND b` | Value is in a range (both ends included) |
| `ORDER BY ... ASC/DESC` | Sorting |
| `LIKE` | Pattern: `%` = any characters, `_` = one character |
| `IS NULL` | Value is missing (`= NULL` never works) |
| `AND / OR / NOT` | Combine / reverse conditions |

**DELETE vs TRUNCATE vs DROP:**

| | DELETE | TRUNCATE | DROP |
|--|--------|----------|------|
| Type | DML | DDL | DDL |
| WHERE allowed | Yes | No | No |
| Removes | Selected rows | All rows | Whole table |
| Table stays | Yes | Yes | No |
| Rollback | Yes | Oracle/MySQL: No (PostgreSQL: yes) | — |

### Lab 03: DRL + functions

| Clause | What it does |
|--------|--------------|
| `GROUP BY` | Puts rows with the same value in one group |
| `HAVING` | Filters **groups** (after GROUP BY) |
| `WHERE` | Filters **rows** (before grouping) |
| `ORDER BY` | Sorts the final result |

| Function type | Functions |
|---------------|-----------|
| Aggregate (many rows → one value) | `COUNT`, `SUM`, `AVG`, `MAX`, `MIN` |
| Date | `CURRENT_DATE` (Oracle `SYSDATE`), `TO_DATE` (text→date), `TO_CHAR` (date→text), `EXTRACT(year FROM ...)` |
| String | `CONCAT`, `SUBSTR`, `LENGTH`, `UPPER`, `LOWER`, `TRIM` |
| Math | `ROUND`, `FLOOR` (down), `CEIL` (up), `MOD` (remainder) |

### Lab 04: Operators

| Type | Operators |
|------|-----------|
| Arithmetic | `+  -  *  /  ^ (power)  % (remainder)` |
| Comparison | `=  !=  <>  >  <  >=  <=` |
| Logical | `AND`, `OR`, `NOT` (AND runs before OR → use brackets) |
| Special | `BETWEEN`, `IS NULL`, `LIKE`, `IN`, `ANY`, `ALL`, `EXISTS` |
| Set | `UNION`, `UNION ALL`, `INTERSECT`, `EXCEPT` (= MINUS) |

- **ANY:** true if the condition holds for **at least one** value of the subquery.
- **ALL:** true if the condition holds for **every** value of the subquery.
- **EXISTS:** true if the subquery returns **at least one row**.

### Set operators: UNION vs UNION ALL etc.

Rule: both SELECTs must have the same number and type of columns.

| Operator | Result |
|----------|--------|
| `UNION` | Rows from both queries, **duplicates removed** |
| `UNION ALL` | Rows from both queries, **duplicates kept** (faster) |
| `INTERSECT` | Only rows found in **both** |
| `EXCEPT` / `MINUS` | Rows in the first query but **not** in the second |

### Lab 06: ER model

| Term | Meaning |
|------|---------|
| **Entity** | A real-world object (one job, one account) |
| **Entity set** | All entities of one type (the jobs table) |
| **Strong entity** | Has its own PK (`accounts`, `jobs`, `companies`): single rectangle |
| **Weak entity** | Needs its owner to be identified (`profiles`, `user_settings`, PK = account_id): double rectangle |
| **Key attribute** | Primary key (`id`) |
| **Composite attribute** | Can be split (`full_name` = first + last) |
| **Multivalued attribute** | Many values (`skills` text[]) |
| **Derived attribute** | Calculated, not stored (total applications) |

**Cardinality:**

| Relationship | Cardinality |
|--------------|-------------|
| Account – Profile | 1 : 1 |
| Recruiter – Jobs | 1 : N |
| Company – Jobs | 1 : N |
| Seeker – Jobs | M : N, via the `applications` and `saved_jobs` tables |

### Lab 07: Joins

A JOIN combines rows of two tables using a related column (FK = PK).

| Join | Result |
|------|--------|
| `INNER JOIN` | Only rows that **match in both** tables |
| `LEFT (OUTER) JOIN` | **All rows of the left** table + matches; no match → NULL |
| `RIGHT (OUTER) JOIN` | **All rows of the right** table + matches; no match → NULL |
| `FULL OUTER JOIN` | **All rows of both** tables; NULL where no match (MySQL: LEFT UNION RIGHT) |
| `CROSS JOIN` | Every row × every row (Cartesian product), no ON condition (5 × 5 = 25 rows) |
| `SELF JOIN` | Table joined with **itself** using two aliases (e.g. two jobs of the same company) |

**Project examples:**

- Sales Intern has no company → it shows up in a LEFT JOIN with a NULL company.
- DataHarbor has no jobs → it shows up in a RIGHT JOIN with a NULL job.
- Noor applied nowhere → LEFT JOIN with `WHERE applications.id IS NULL` finds her.

### Lab 08: Subqueries

A subquery is a query inside another query. The inner query runs first.

| Type | Meaning | Example |
|------|---------|---------|
| Single-row | Returns 1 value; used with `= > <` | Salary > `(SELECT AVG(salary))` |
| Multi-row | Returns many values; used with `IN / ANY / ALL / EXISTS` | Jobs `IN` (jobs Ali applied to) |
| Correlated | Inner query uses the outer row's column → runs **once per row** | Salary > average of **its own** category |
| Nested | Subquery inside a subquery | Second highest salary |

Subqueries can also go in:

- `FROM`: derived / temporary table
- `SELECT`: one value per row
- `HAVING`
- `JOIN`
- `INSERT ... SELECT`
- `UPDATE ... WHERE (subquery)`
- `DELETE ... WHERE (subquery)`

### Lab 09: Indexes + views

**INDEX:** a lookup structure (B-Tree) like a book index, so rows are found without reading the whole table.

- Plus: faster SELECT / WHERE / ORDER BY / JOIN.
- Minus: extra space; INSERT / UPDATE get a little slower.
- PRIMARY KEY and UNIQUE create an index automatically.

| Index type | Example |
|------------|---------|
| Normal | `CREATE INDEX idx ON t (category)` |
| Unique | `CREATE UNIQUE INDEX ...`: fast lookup + no duplicates |
| Composite | Index on 2+ columns `(location, salary_max)` |
| Function | Index on `lower(company_name)`: case-insensitive search |

- `DROP INDEX` removes an index.
- `EXPLAIN` shows whether a query uses an index or reads every row (Seq Scan).

**VIEW:** a saved SELECT query that behaves like a virtual table. It **stores no data** and is always up to date.

- Plus: hides a complex query behind a simple name.
- Plus: security, because you can show only some columns or rows.
- `CREATE VIEW`, `CREATE OR REPLACE VIEW` (change it), `DROP VIEW`.
- The project's view: `job_application_counts`.

---

## 4. Other keywords used in the file

| Keyword | What it does |
|---------|--------------|
| `IF EXISTS` / `IF NOT EXISTS` | Skip the error if the object is already there / missing (the file can run again) |
| `ON CONFLICT DO NOTHING` | Skip the insert if the row already exists (no duplicate error) |
| `CREATE OR REPLACE` | Create, or replace if it already exists (views, functions) |
| `gen_random_uuid()` | Generates a unique id |
| `now()` / `CURRENT_DATE` | Current date-time / date |
| `INTERVAL '10 days'` | A time duration (`now() - interval '10 days'`) |
| `TRIGGER` | Runs a function automatically on INSERT / UPDATE (e.g. sets `updated_at`, creates the profile) |
| `FUNCTION` | Stored code in the database (e.g. `increment_job_views`) |
| `EXTENSION` | Add-on for Postgres (`pgcrypto`, `pg_trgm` for fast text search) |
| `RLS` (Row Level Security) | Controls which rows a user can see |
| `POLICY` | One RLS rule (e.g. anyone can read active jobs) |
| `GRANT` / `REVOKE` | Give / take permissions (DCL) |
| `BEGIN` / `COMMIT` / `ROLLBACK` | Start / save / undo a transaction (TCL) |
| `information_schema` | System tables that describe the DB (like `sys.tables`) |
| `pg_indexes` | System view that lists indexes |

---

## 5. Oracle / MySQL vs PostgreSQL

| Lab manual | PostgreSQL (this project) |
|------------|---------------------------|
| `MINUS` | `EXCEPT` |
| `SELECT TOP 3` | `LIMIT 3` |
| `MODIFY column` | `ALTER COLUMN ... TYPE` |
| `SYSDATE` / `FROM dual` | `CURRENT_DATE` (no dual) |
| `RENAME TABLE a TO b` | `ALTER TABLE a RENAME TO b` |
| `USE db` | `SET search_path` |
| `DROP PRIMARY KEY` | `DROP CONSTRAINT table_pkey` |
| `sys.tables` | `information_schema.tables` |
| `BLOB / RAW`, `CLOB / LONG` | `BYTEA`, `TEXT` |

---

## 6. Quick viva Q&A

- **DELETE vs TRUNCATE?** DELETE removes selected rows (WHERE, rollback). TRUNCATE removes all rows at once (DDL).
- **WHERE vs HAVING?** WHERE filters rows before grouping. HAVING filters groups after GROUP BY.
- **Primary key vs Unique?** A PK can't be NULL and there is only one per table. There can be many UNIQUE columns, and UNIQUE allows NULL.
- **Primary key vs Foreign key?** A PK identifies a row. An FK points to another table's PK.
- **UNION vs UNION ALL?** UNION removes duplicates. UNION ALL keeps them.
- **INNER vs LEFT JOIN?** INNER gives only matches. LEFT gives all left rows + NULLs.
- **Correlated vs nested subquery?** Correlated runs once per outer row. Nested runs inside out, once.
- **View vs table?** A view stores no data, only the query.
- **Index ka fayda / nuqsan?** Faster reads, but extra space and slower writes.
- **Schema kya hai?** A namespace (folder) of tables. Here `public` = app data and `lab` = practice.
- **ON CONFLICT kya karta hai?** If the row already exists, it skips (or updates) instead of failing.
- **Weak entity example?** `profiles`, which can't exist without its account.
- **M:N relationship kaise banta hai?** With a third table holding two FKs (`applications`).

---

## 7. How the website uses the database

**Stack:** Next.js 15 (frontend + API routes) → `@supabase/supabase-js` → Supabase PostgreSQL. Hosted on Netlify, code on GitHub.

```
Browser (React pages)  →  Next.js API routes (/api/...)  →  Supabase (PostgreSQL)
```

- The browser **never** talks to the private tables directly. Every read/write goes through an API route on the server.
- The server uses the **service role key** (`SUPABASE_SERVICE_ROLE_KEY`), which bypasses RLS. That key is secret and only lives in server environment variables.
- The **anon key** is public. Because of `REVOKE ALL ... FROM anon, authenticated`, the anon key can't read `accounts`, `sessions`, `applications`, `saved_jobs`, etc. (DCL in practice).

**Tables each feature uses:**

| Feature | API route | Tables |
|---------|-----------|--------|
| Sign up / login / logout | `/api/auth/*` | `accounts`, `sessions` (+ trigger creates `profiles`, `user_settings`) |
| Browse / search jobs | `GET /api/jobs` | `jobs` (JOIN `accounts` for recruiter name), `ILIKE` search, `LIMIT/OFFSET` paging |
| Job detail | `GET /api/jobs/[id]` | `jobs` + function `increment_job_views` (RPC) |
| Post a job | `POST /api/jobs` | `companies` (find or create by slug), `jobs` |
| Apply to a job | `POST /api/jobs/[id]/apply` | `applications` (unique index on job + applicant stops double apply) |
| Save / unsave job | `/api/jobs/[id]/save` | `saved_jobs` |
| Recruiter changes status | `PATCH /api/applications/[id]` | `applications` (CHECK: pending / reviewing / interview / rejected / hired) |
| Dashboard stats | `/api/dashboard` | `jobs` |
| My profile / settings | `/api/users/me` | `accounts`, `profiles`, `user_settings` |
| Companies page | `/api/companies` | `companies` |

**Login (custom auth, no Supabase Auth):**

1. Password is hashed with **scrypt + random salt** (Node `crypto`) and stored in `accounts.password_hash`. The plain password is never stored.
2. On login the server signs a **JWT** (HS256, secret = `AUTH_SECRET`) and puts it in an **httpOnly cookie** (`wk_session`, 7 days).
3. A hash of the token is stored in `sessions`. Logout sets `revoked_at`, so the token stops working even before it expires.
4. `middleware.js` checks the cookie: no login → `/dashboard` redirects to `/sign-in`.

**Viva Q&A (project):**

- **Why API routes instead of calling Supabase from the browser?** So the secret key and private tables stay on the server.
- **Why hash passwords?** If the DB leaks, the real passwords are not exposed. Salt makes the same password give different hashes.
- **What stops SQL injection?** supabase-js sends values as parameters, not glued into the SQL string. Search text is also cleaned (`sanitizeSearch`).
- **Where are the keys stored?** In `.env.local` locally (not pushed to GitHub, it is in `.gitignore`) and in Netlify environment variables online.

---

## 8. Deployment (Netlify + GitHub)

- Code is pushed to GitHub (`ALIRAZA4278/work-oura`). Netlify builds it with `npm run build` and serves the Next.js app; API routes run as serverless functions.
- Environment variables set in Netlify: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`.
- The database schema is created once by running `sql/schema.sql` in the Supabase SQL Editor. The lab files (`ALL_IN_ONE.sql`) only use the separate `lab` schema.
