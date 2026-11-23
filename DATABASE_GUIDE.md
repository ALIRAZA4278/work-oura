# Database ↔ Frontend Guide

This document explains **which database table and column each screen of the website uses, and which file does the work**. Keep it open while reading the code.

- **Database:** Supabase (PostgreSQL). Structure: `sql/schema.sql`
- **Every code file starts with a header comment** that says what the file does and which tables it touches.

---

## 1. How data travels

```
① PAGE (browser)          src/app/jobs/page.js
   fetch("/api/jobs")       data in camelCase: jobTitle
        │   ▲
        ▼   │ JSON response
② API ROUTE (server)      src/app/api/jobs/route.js  →  GET() / POST()
   login check, validation, lib/mappers.js: jobTitle ⇄ job_title
        │   ▲
        ▼   │ rows
③ LIB                     src/lib/supabase.js  →  getSupabaseAdmin()
   URL + service role key (.env.local / Netlify)
        │   ▲
        ▼   │
④ DATABASE (Supabase)     tables: jobs, accounts ...  columns in snake_case: job_title
```

**4 layers, 4 folders:**

| Layer | Folder | Job |
|-------|--------|-----|
| ① Page | `src/app/*/page.js`, `src/components/`, `src/context/` | Shows the screen, sends form data with `fetch()` |
| ② API route | `src/app/api/**/route.js` | Checks login, validates, then queries the database |
| ③ Lib | `src/lib/` | Database connection, field name conversion, login sessions |
| ④ Database | `sql/schema.sql` | Tables, foreign keys, triggers, security |

**The database connection is created in one place:** `src/lib/supabase.js` → `getSupabaseAdmin()`. It reads `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from `.env.local` (or Netlify) and creates the Supabase client. Every API route calls this function.

**A supabase-js query and SQL are the same thing:**

| supabase-js (in the code) | SQL (in the labs) |
|---------------------------|-------------------|
| `supabase.from('jobs').select('*').eq('status','active')` | `SELECT * FROM jobs WHERE status = 'active'` |
| `.insert({ job_title: 'X' })` | `INSERT INTO jobs (job_title) VALUES ('X')` |
| `.update({ status: 'hired' }).eq('id', id)` | `UPDATE applications SET status='hired' WHERE id = ...` |
| `.delete().eq('id', id)` | `DELETE FROM jobs WHERE id = ...` |
| `.upsert({...})` | `INSERT ... ON CONFLICT DO UPDATE` |
| `.order('created_at', { ascending: false })` | `ORDER BY created_at DESC` |
| `.range(0, 9)` | `LIMIT 10 OFFSET 0` |
| `.ilike('location', '%Lahore%')` | `WHERE location ILIKE '%Lahore%'` |
| `select('*, recruiter:accounts!jobs_recruiter_id_fkey(full_name)')` | `JOIN accounts ON accounts.id = jobs.recruiter_id` |

---

## 2. How the tables are connected

```
accounts (id)                         ← center table, one row per user
 ├── 1:1 ── profiles.account_id        bio, skills, phone
 ├── 1:1 ── user_settings.account_id   dashboard toggles
 ├── 1:N ── sessions.account_id        login sessions
 ├── 1:N ── companies.owner_id         who created the company
 ├── 1:N ── jobs.recruiter_id          a recruiter's jobs
 ├── 1:N ── applications.applicant_id  a seeker's applications
 └── 1:N ── saved_jobs.account_id      a user's bookmarks

companies (id)
 └── 1:N ── jobs.company_id            a company's jobs

jobs (id)
 ├── 1:N ── applications.job_id        applications to the job
 └── 1:N ── saved_jobs.job_id          who saved it
```

**Every foreign key (FK):**

| Child table.column | → Parent table.column | Meaning | When the parent is deleted |
|--------------------|----------------------|---------|----------------------------|
| `profiles.account_id` | `accounts.id` | One profile per account (1:1, also the PK) | profile deleted |
| `user_settings.account_id` | `accounts.id` | One settings row per account (1:1) | deleted |
| `sessions.account_id` | `accounts.id` | Whose login session | deleted |
| `companies.owner_id` | `accounts.id` | Who created the company | set to `NULL` |
| `jobs.recruiter_id` | `accounts.id` | Which recruiter posted the job (1:N) | job deleted |
| `jobs.company_id` | `companies.id` | Which company the job belongs to (1:N) | set to `NULL` |
| `applications.job_id` | `jobs.id` | Which job was applied to | application deleted |
| `applications.applicant_id` | `accounts.id` | Which seeker applied | application deleted |
| `saved_jobs.account_id` | `accounts.id` | Which user saved it | deleted |
| `saved_jobs.job_id` | `jobs.id` | Which job was saved | deleted |

**M:N (many-to-many):**
- **Seekers ↔ Jobs** = the `applications` table (two FKs: `job_id`, `applicant_id`). One seeker applies to many jobs; one job gets many seekers.
- **Users ↔ Jobs** = the `saved_jobs` table (PK = `account_id + job_id`).

**Uniqueness rules:**
- Unique index on `applications (job_id, applicant_id)` → a user can apply to a job only once.
- `saved_jobs` PK `(account_id, job_id)` → a job can be saved only once per user.
- `accounts.email` is unique and always lowercase.
- `companies.slug` is unique → "Tech Nova" and "tech nova" are the same company.

---

## 3. Every table: column → frontend field → where it appears

Database names are `snake_case`; frontend names are `camelCase`. The conversion is done by `src/lib/mappers.js` (jobs, applications, companies) and by `serializeAccount()` in `src/lib/auth.js` (users).

### 3.1 `accounts` (users)

| Column | Frontend field | Set where | Shown where |
|--------|----------------|-----------|-------------|
| `id` (uuid, PK) | `user.id` | Automatically on sign-up | Used for every ownership check |
| `email` | `user.email` | Sign-up form | Navbar menu, Profile tab |
| `password_hash` | — (never sent out) | Sign-up (scrypt hash) | Only used to check the login |
| `full_name` | `user.name`, `firstName`, `lastName` | Sign-up, Profile tab | "Welcome back, Ali!" |
| `role` | `user.role` | Sign-up, Profile tab | Dashboard: recruiter or seeker view |
| `is_active` | — | — | Login is blocked if false |
| `last_login_at` | — | Every login | — |
| `created_at`, `updated_at` | `createdAt`, `updatedAt` | Automatically (trigger) | — |

### 3.2 `profiles` (1:1 with accounts)

| Column | Frontend field | Form |
|--------|----------------|------|
| `account_id` (PK + FK) | — | Created by a trigger on sign-up |
| `phone` | `profile.phone` | Dashboard → Profile → Phone Number |
| `bio` | `profile.bio` | Profile → Professional Bio |
| `skills` (text[] array) | `profile.skills` | Profile (comma separated: "React, SQL") |
| `education` | `profile.education` | Profile |
| `location` | `profile.location` | Profile → Location |
| `resume_url` | `profile.resume` | — |
| `experience`, `website`, `linkedin`, `github`, `avatar_url` | `profile.experience` ... `profile.avatar` | For future use |

### 3.3 `user_settings` (1:1 with accounts)

| Column | Frontend field | UI |
|--------|----------------|----|
| `email_notifications` | `settings.emailNotifications` | Dashboard → Quick Settings toggle |
| `job_alerts` | `settings.jobAlerts` | toggle |
| `profile_visibility` | `settings.profileVisibility` | toggle |
| `two_factor_auth` | `settings.twoFactorAuth` | toggle |

### 3.4 `jobs`

| Column | Frontend field | Post Job form field | Shown where |
|--------|----------------|---------------------|-------------|
| `id` | `id` | — | URL `/jobs/<id>` |
| `recruiter_id` (FK) | `recruiterId`, `recruiter.name` | The logged-in user, automatically | Job detail |
| `company_id` (FK) | `companyId` | Found or created from the company name | Companies page grouping |
| `job_title` | `jobTitle` | Job Title | Job card heading |
| `company_name` | `companyName` | Company Name | Job card |
| `company_logo` | `companyLogo` | Company Logo URL | Job card image |
| `job_description` | `jobDescription` | Job Description | Job detail |
| `job_type` | `jobType` | Job Type (Full-time...) | Badge, filter |
| `experience_level` | `experienceLevel` | Experience Level | Badge, filter |
| `category` | `category` | Category | Filter |
| `required_skills` (text[]) | `requiredSkills` | Required Skills (comma separated) | Skill chips |
| `location` | `location` | Location | Card, location search |
| `salary_min`, `salary_max` | `salaryMin`, `salaryMax` | Min / Max Salary | "60K - 90K" |
| `deadline` | `deadline` | Application Deadline | "Deadline: ..." |
| `openings` | `openings` | Number of Openings | Job detail |
| `is_test_required` | `isTestRequired` | Technical assessment checkbox | "No Test Required" |
| `contact_email` | `contactEmail` | Contact Email | The application email goes here |
| `apply_link` | `applyLink` | External Apply Link | Job detail |
| `status` | `status` | — (default `active`) | Only `active` jobs are listed |
| `views` | `views` | — | +1 each time the job detail opens |

### 3.5 `applications`

| Column | Frontend field | Comes from |
|--------|----------------|------------|
| `job_id` (FK → jobs) | `jobId` | The job on the job detail page |
| `applicant_id` (FK → accounts) | `applicantId` | The logged-in user |
| `cover_letter` | `coverLetter` | Apply form → Cover Letter |
| `resume` | `resume` | Apply form → resume file name |
| `status` | `status` | Defaults to `pending`; the recruiter changes it with a dropdown |
| `name`, `email`, `phone`, `skills`, `bio`, `education` | same names | Apply form fields (`customFields`) |
| `job_title`, `company_name`, `location` | same (camelCase) | Copied from the job when applying (snapshot) |
| `applicant_score` | `applicantScore` | — (used by the labs) |
| `applied_at` | `appliedAt` | Automatic: "Applied 11/22/2026" |

**Why a snapshot?** If the recruiter later renames the job, the old application keeps the title the seeker actually applied to.

### 3.6 `saved_jobs`, `companies`, `sessions`

| Table | Columns | Frontend |
|-------|---------|----------|
| `saved_jobs` | `account_id`, `job_id`, `created_at` | Bookmark button on the jobs page |
| `companies` | `name`, `slug`, `industry`, `location`, `logo_url`→`logo`, `size`, `website`, `description` | Companies page cards |
| `sessions` | `account_id`, `token_hash`, `expires_at`, `revoked_at`, `user_agent`, `ip_address` | No UI; keeps the user logged in |

---

## 4. Every feature: which file → which table

Format: **Page file** → `fetch` → **API file** → **lib** → **what it does in SQL terms**

### 4.1 Sign up
1. `src/app/sign-up/page.js` form → `signup()` in `src/context/AuthContext.js`
2. `POST /api/auth/signup` → `src/app/api/auth/signup/route.js`
3. `src/lib/password.js` hashes the password
4. `SELECT id FROM accounts WHERE email = ?` (does it already exist?)
5. `INSERT INTO accounts (email, password_hash, full_name, role)`
6. **Triggers** run automatically: `INSERT INTO profiles` and `INSERT INTO user_settings`
7. `createSession()` in `src/lib/auth.js` → `INSERT INTO sessions` + cookie

### 4.2 Login / logout / "who is logged in"
| Action | API file | Database |
|--------|----------|----------|
| Login | `api/auth/login/route.js` | `SELECT password_hash FROM accounts WHERE email=?` → `INSERT INTO sessions` |
| Current user on every page | `api/auth/me/route.js` → `lib/auth.js` | `sessions` (match token_hash) → `accounts` JOIN `profiles`, `user_settings` |
| Logout | `api/auth/logout/route.js` | `UPDATE sessions SET revoked_at = now()` |
| Protected pages | `src/middleware.js` | No database; only checks the JWT in the cookie |

### 4.3 Browse / search jobs
1. `src/app/jobs/page.js` → `fetch('/api/jobs?search=React&location=Lahore&page=1')`
2. `GET` in `src/app/api/jobs/route.js`:
   `SELECT ... FROM jobs JOIN accounts ON accounts.id = jobs.recruiter_id WHERE status='active' AND (job_title ILIKE '%React%' OR ...) AND location ILIKE '%Lahore%' ORDER BY created_at DESC LIMIT 10`
3. `jobRowToApi()` in `lib/mappers.js` → turns `job_title` into `jobTitle`
4. `src/components/JobCard.js` shows the card

### 4.4 Job detail
`src/app/jobs/[id]/page.js` → `GET /api/jobs/<id>` → `src/app/api/jobs/[id]/route.js` → `SELECT ... FROM jobs WHERE id=?` + `increment_job_views()` (SQL function, `views + 1`)

### 4.5 Post a job (recruiter)
1. `src/components/JobPostModal.js` form → `src/app/dashboard/page.js` → `POST /api/jobs`
2. `POST` in `src/app/api/jobs/route.js`:
   - Login check (`lib/auth.js`)
   - Company: `SELECT id FROM companies WHERE slug='workoura-tech'` → if not found, `INSERT INTO companies`
   - `jobApiToRow()` in `lib/mappers.js` → turns form fields into columns
   - `INSERT INTO jobs (recruiter_id, company_id, job_title, ...)`
3. Edit: `PUT /api/jobs/<id>` → `UPDATE jobs`. Delete: `DELETE /api/jobs/<id>` → `DELETE FROM jobs` (cascade also removes its applications and saved_jobs)

### 4.6 Apply (job seeker)
1. `src/app/jobs/[id]/page.js` Apply form → `POST /api/applications` with `{ jobId, coverLetter, resume, customFields: { name, email, phone, skills, bio, education } }`
2. `src/app/api/applications/route.js` → `createApplication()` in `src/lib/applications.js`:
   - `SELECT status, recruiter_id FROM jobs WHERE id=?` (active? not your own job?)
   - `INSERT INTO applications (job_id, applicant_id, cover_letter, status, name, email, ..., job_title, company_name, location)`
   - Applying twice → unique index error `23505` → "You have already applied to this job"
3. Then `POST /api/apply` → email to the recruiter (no database)

### 4.7 View applications + change status
| Action | File | Database |
|--------|------|----------|
| Seeker: my applications | `GET` in `api/applications/route.js` | `SELECT ... FROM applications WHERE applicant_id = me` |
| Recruiter: applications to my jobs | same | `SELECT id FROM jobs WHERE recruiter_id = me` → `... WHERE job_id IN (...)` |
| Applications for one job | `GET /api/applications?jobId=` | `WHERE job_id = ?` (only that job's recruiter) |
| Status dropdown | `PATCH` in `api/applications/[id]/route.js` | check `jobs.recruiter_id` → `UPDATE applications SET status=?` |

Each application comes with joined data (`APPLICATION_SELECT` in `lib/applications.js`):
`applications.job_id → jobs` (title, salary) and `applications.applicant_id → accounts → profiles` (name, skills).

### 4.8 Dashboard stats / My Jobs
`src/app/dashboard/page.js` → `GET /api/dashboard` → `src/app/api/dashboard/route.js` → `SELECT *, (SELECT count(*) FROM applications WHERE job_id = jobs.id) FROM jobs WHERE recruiter_id = me`

### 4.9 Profile + settings
`src/app/dashboard/page.js` (Profile tab) → `GET/PUT /api/users` → `src/app/api/users/route.js` → `src/lib/accounts.js`:
- `UPDATE accounts SET full_name, role`
- `UPSERT profiles (phone, bio, skills, location, education ...)`
- `UPSERT user_settings (email_notifications, job_alerts ...)`

### 4.10 Save a job
`src/app/jobs/page.js` bookmark → `POST` / `DELETE /api/jobs/<id>/save` → `src/app/api/jobs/[id]/save/route.js` → `INSERT ... ON CONFLICT (account_id, job_id) DO UPDATE` / `DELETE FROM saved_jobs WHERE account_id=? AND job_id=?`

### 4.11 Companies page
`src/app/companies/page.js` → `GET /api/companies` → `src/app/api/companies/route.js` → `SELECT * FROM companies` + `SELECT * FROM jobs WHERE status='active'` → groups jobs under their company with `jobs.company_id = companies.id`

---

## 5. Things that run automatically inside the database (`sql/schema.sql`)

| Name | Type | When it runs | What it does |
|------|------|--------------|--------------|
| `set_updated_at()` | function + 6 triggers | Every UPDATE (accounts, profiles, user_settings, companies, jobs, applications) | `updated_at = now()` |
| `create_profile_for_account()` | trigger | After `INSERT INTO accounts` | Creates an empty `profiles` row |
| `create_settings_for_account()` | trigger | After `INSERT INTO accounts` | Creates a default `user_settings` row |
| `increment_job_views(p_job_id)` | function | When the job detail page opens (API `rpc`) | `jobs.views + 1` |
| `purge_expired_sessions()` | function | Manually | Deletes expired sessions |
| `job_application_counts` | view | — | Application count per job (server only) |
| RLS policies | security | Reads with the public key | Only `active` jobs and companies are public; everything else is closed |

---

## 6. All files at a glance

| File | Relationship to the database |
|------|------------------------------|
| `src/lib/supabase.js` | Creates the **connection** (URL + key) |
| `src/lib/mappers.js` | `snake_case` ↔ `camelCase` (jobs, applications, companies) |
| `src/lib/auth.js` | `sessions`, `accounts` (+ profiles, settings join), cookie |
| `src/lib/accounts.js` | Profile update: `accounts`, `profiles`, `user_settings` |
| `src/lib/applications.js` | Apply: check `jobs`, insert `applications`, joined list |
| `src/lib/password.js`, `jwt.js` | No database; hashing and tokens |
| `src/app/api/auth/*` | `accounts`, `sessions` |
| `src/app/api/jobs/route.js` | `jobs` (list, create), `companies` (find / create) |
| `src/app/api/jobs/[id]/route.js` | One `jobs` row: read, update, delete, views |
| `src/app/api/jobs/[id]/save/route.js` | `saved_jobs` |
| `src/app/api/applications/*` | `applications` (+ `jobs` owner check) |
| `src/app/api/dashboard/route.js` | A recruiter's `jobs` + application counts |
| `src/app/api/companies/route.js` | `companies` + active `jobs` |
| `src/app/api/users/route.js` | `accounts`, `profiles`, `user_settings` |
| `src/app/api/apply/route.js` | **No** database; email only |
| `src/context/AuthContext.js` | Calls the auth APIs; gives the user to the whole site |
| `src/middleware.js` | **No** database; checks the cookie and redirects |
| `sql/schema.sql` | All tables, FKs, triggers, RLS |

---

## 7. Viva questions

- **How does the frontend connect to the database?** Not directly. A page calls `fetch('/api/...')`, and the API route runs the query through `getSupabaseAdmin()` (`src/lib/supabase.js`).
- **What is the difference between `jobTitle` and `job_title`?** They are the same value. The DB uses `snake_case`, JavaScript uses `camelCase`; `src/lib/mappers.js` converts between them.
- **How are recruiters and jobs connected?** `jobs.recruiter_id` is an FK → `accounts.id` (1:N).
- **How do we know who applied to which job?** The `applications` table: `job_id` → `jobs`, `applicant_id` → `accounts`. It is an M:N relationship.
- **Who creates the profile on sign-up?** The database trigger `create_profile_for_account()`, not the app code.
- **What happens to applications when a job is deleted?** `ON DELETE CASCADE` deletes them too.
- **Why can't someone apply twice?** The unique index on `(job_id, applicant_id)`.
- **Why can't a recruiter change the status of another recruiter's application?** The API first checks that `jobs.recruiter_id` is the logged-in user; otherwise it returns 403.
