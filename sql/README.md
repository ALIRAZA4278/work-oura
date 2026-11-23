# SQL: Supabase (PostgreSQL)

The whole project schema is in `schema.sql`. In the Supabase Dashboard, open the
**SQL Editor**, paste the full file and run it once.

| Section | Part | Tables / objects |
|---------|------|------------------|
| `00_extensions` | Setup | `pgcrypto`, `pg_trgm`, `set_updated_at()` |
| `01_accounts` | **Account** | `accounts` |
| `02_login` | **Login** | `sessions`, `password_reset_tokens`, `email_verification_tokens`, `purge_expired_sessions()` |
| `03_profiles` | **Profile** | `profiles` (+ auto-create trigger) |
| `04_settings` | **Settings** | `user_settings` (+ auto-create trigger) |
| `05_companies` | **Company** | `companies` |
| `06_job_post` | **Job post** | `jobs`, `increment_job_views()` |
| `07_applications` | **Job application** | `applications`, `job_application_counts` view |
| `08_saved_jobs` | **Saved jobs** | `saved_jobs` |
| `09_rls_policies` | **Security / RLS** | policies + grants |
| `10_seed` | Demo data (optional) | sample companies |

## DBMS lab queries (`labs/`)

Queries for every topic of the lab manuals, written on this project's tables,
with a comment on every topic and query. Run them in order after `schema.sql`:

| File | Topics |
|------|--------|
| `labs/lab00_demo_data.sql` | Demo accounts, jobs, applications, saved jobs + `lab` schema |
| `labs/lab01_ddl_constraints.sql` | Data types, CREATE / ALTER / RENAME / TRUNCATE / DROP, constraints |
| `labs/lab02_dml_operators.sql` | INSERT, UPDATE, DELETE, SELECT, DISTINCT, COUNT, TOP/LIMIT, AS, IN, BETWEEN, ORDER BY, LIKE, IS NULL, AND/OR/NOT |
| `labs/lab03_drl_functions.sql` | WHERE, GROUP BY, HAVING, UNION / INTERSECT / EXCEPT, aggregate, date, string, math functions |
| `labs/lab04_sql_operators.sql` | Arithmetic, logical, comparison, special (ALL, ANY, EXISTS...), set operators |
| `labs/lab06_er_model.sql` | ER model, attribute types, relationships + cardinality |
| `labs/lab07_joins.sql` | INNER, LEFT, RIGHT, FULL, CROSS, SELF join |
| `labs/lab08_subqueries.sql` | Single-row, multi-row, correlated, nested subqueries; INSERT/UPDATE/DELETE with subquery |
| `labs/lab09_indexes_views.sql` | CREATE / UNIQUE / composite / DROP INDEX, CREATE / REPLACE / DROP VIEW |

- DDL / UPDATE / DELETE practice runs in the `lab` schema, so `public` (the app's data) is safe.
- `ALL_IN_ONE.sql` contains all 9 lab files in one file (run it after `schema.sql`).
- The Supabase SQL Editor only shows the last result: highlight one query and click Run to see its result.
- The lab manuals use Oracle / MySQL / SQL Server syntax; the PostgreSQL difference
  (MINUS -> EXCEPT, TOP -> LIMIT, MODIFY -> ALTER COLUMN TYPE, SYSDATE -> CURRENT_DATE)
  is noted in a comment where it applies.
- To clean up: `drop schema lab cascade;`

## Quick run (psql)

```bash
psql "$SUPABASE_DB_URL" -f sql/schema.sql
psql "$SUPABASE_DB_URL" -f sql/ALL_IN_ONE.sql   # DBMS lab queries
```

## Notes

- **Login does not use Supabase Auth.** The app has its own email + password login:
  the password is hashed with `scrypt` (`accounts.password_hash`), and the session
  is a signed JWT cookie whose SHA-256 hash is stored in `sessions.token_hash`
  (so logout / revocation works on the server).
- Server-side code uses `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS. Never
  expose this key in the browser.
- RLS is **on** for every table. Only `jobs` (active) and `companies` can be read
  with the anon key; everything else is server-only.
