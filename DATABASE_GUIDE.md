# Database ↔ Frontend Guide

Ye document batata hai ke **website ki har screen database ki kis table aur kis column se judi hai, aur kaun si file ye kaam karti hai**. Code parhte waqt isi ko saath rakho.

- **Database:** Supabase (PostgreSQL). Structure: `sql/schema.sql`
- **Har code file ke shuru mein** `DB CONNECTION MAP` comment hai. Wahan bhi yahi info short mein likhi hai.

---

## 1. Data kaise travel karta hai

```
① PAGE (browser)          src/app/jobs/page.js
   fetch("/api/jobs")       data camelCase mein: jobTitle
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
④ DATABASE (Supabase)     tables: jobs, accounts ...  columns snake_case: job_title
```

**4 layers, 4 folders:**

| Layer | Folder | Kaam |
|-------|--------|------|
| ① Page | `src/app/*/page.js`, `src/components/`, `src/context/` | Screen dikhana, form ka data `fetch()` se bhejna |
| ② API route | `src/app/api/**/route.js` | Login check, validation, phir database query |
| ③ Lib | `src/lib/` | Database connection, field naam badalna, login session |
| ④ Database | `sql/schema.sql` | Tables, foreign keys, triggers, security |

**Database connection ek hi jagah banta hai:** `src/lib/supabase.js` → `getSupabaseAdmin()`. Ye `.env.local` (ya Netlify) se `NEXT_PUBLIC_SUPABASE_URL` aur `SUPABASE_SERVICE_ROLE_KEY` le ke Supabase client banata hai. Har API route isi function ko call karta hai.

**supabase-js ki query aur SQL ek hi cheez hain:**

| supabase-js (code mein) | SQL (lab mein) |
|-------------------------|----------------|
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

## 2. Tables ek doosre se kaise judi hain

```
accounts (id)                         ← center table, har user ki 1 row
 ├── 1:1 ── profiles.account_id        bio, skills, phone
 ├── 1:1 ── user_settings.account_id   dashboard toggles
 ├── 1:N ── sessions.account_id        login sessions
 ├── 1:N ── companies.owner_id         company kisne banai
 ├── 1:N ── jobs.recruiter_id          recruiter ki jobs
 ├── 1:N ── applications.applicant_id  seeker ki applications
 └── 1:N ── saved_jobs.account_id      user ke bookmarks

companies (id)
 └── 1:N ── jobs.company_id            company ki jobs

jobs (id)
 ├── 1:N ── applications.job_id        job pe aayi applications
 └── 1:N ── saved_jobs.job_id          kis kis ne save ki
```

**Har foreign key (FK):**

| Child table.column | → Parent table.column | Matlab | Parent delete ho to |
|--------------------|----------------------|--------|---------------------|
| `profiles.account_id` | `accounts.id` | Har account ki 1 profile (1:1, ye PK bhi hai) | profile delete |
| `user_settings.account_id` | `accounts.id` | Har account ki 1 settings row (1:1) | delete |
| `sessions.account_id` | `accounts.id` | Kis user ka login session | delete |
| `companies.owner_id` | `accounts.id` | Company kisne banai | `NULL` ho jata hai |
| `jobs.recruiter_id` | `accounts.id` | Job kis recruiter ne post ki (1:N) | job delete |
| `jobs.company_id` | `companies.id` | Job kis company ki hai (1:N) | `NULL` ho jata hai |
| `applications.job_id` | `jobs.id` | Kis job pe apply kiya | application delete |
| `applications.applicant_id` | `accounts.id` | Kis seeker ne apply kiya | application delete |
| `saved_jobs.account_id` | `accounts.id` | Kis user ne save ki | delete |
| `saved_jobs.job_id` | `jobs.id` | Kaunsi job save hui | delete |

**M:N (many-to-many):**
- **Seekers ↔ Jobs** = `applications` table (do FKs: `job_id`, `applicant_id`). Ek seeker bohot jobs pe, ek job pe bohot seekers.
- **Users ↔ Jobs** = `saved_jobs` table (PK = `account_id + job_id`).

**Uniqueness rules:**
- `applications (job_id, applicant_id)` unique index → ek job pe ek user sirf 1 baar apply.
- `saved_jobs` PK `(account_id, job_id)` → ek job sirf 1 baar save.
- `accounts.email` unique + hamesha lowercase.
- `companies.slug` unique → "Tech Nova" aur "tech nova" ek hi company.

---

## 3. Har table: column → frontend field → kahan dikhta hai

Database mein naam `snake_case`, frontend mein `camelCase`. Ye badalna `src/lib/mappers.js` (jobs, applications, companies) aur `src/lib/auth.js` → `serializeAccount()` (users) karte hain.

### 3.1 `accounts` (users)

| Column | Frontend field | Kahan set hota hai | Kahan dikhta hai |
|--------|----------------|--------------------|------------------|
| `id` (uuid, PK) | `user.id` | Signup pe khud | Har jagah owner check |
| `email` | `user.email` | Sign-up form | Navbar menu, Profile tab |
| `password_hash` | — (kabhi bahar nahi jata) | Sign-up (scrypt hash) | Sirf login check |
| `full_name` | `user.name`, `firstName`, `lastName` | Sign-up, Profile tab | "Welcome back, Ali!" |
| `role` | `user.role` | Sign-up, Profile tab | Dashboard: recruiter ya seeker view |
| `is_active` | — | — | Login: false ho to block |
| `last_login_at` | — | Har login pe | — |
| `created_at`, `updated_at` | `createdAt`, `updatedAt` | Khud (trigger) | — |

### 3.2 `profiles` (1:1 with accounts)

| Column | Frontend field | Form |
|--------|----------------|------|
| `account_id` (PK + FK) | — | Signup pe trigger khud banata hai |
| `phone` | `profile.phone` | Dashboard → Profile → Phone Number |
| `bio` | `profile.bio` | Profile → Professional Bio |
| `skills` (text[] array) | `profile.skills` | Profile (comma se alag: "React, SQL") |
| `education` | `profile.education` | Profile |
| `location` | `profile.location` | Profile → Location |
| `resume_url` | `profile.resume` | — |
| `experience`, `website`, `linkedin`, `github`, `avatar_url` | `profile.experience` ... `profile.avatar` | Future use |

### 3.3 `user_settings` (1:1 with accounts)

| Column | Frontend field | UI |
|--------|----------------|----|
| `email_notifications` | `settings.emailNotifications` | Dashboard → Quick Settings toggle |
| `job_alerts` | `settings.jobAlerts` | toggle |
| `profile_visibility` | `settings.profileVisibility` | toggle |
| `two_factor_auth` | `settings.twoFactorAuth` | toggle |

### 3.4 `jobs`

| Column | Frontend field | Post Job form field | Kahan dikhta hai |
|--------|----------------|---------------------|------------------|
| `id` | `id` | — | URL `/jobs/<id>` |
| `recruiter_id` (FK) | `recruiterId`, `recruiter.name` | Logged-in user khud | Job detail |
| `company_id` (FK) | `companyId` | Company naam se khud milta / banta hai | Companies page grouping |
| `job_title` | `jobTitle` | Job Title | Job card heading |
| `company_name` | `companyName` | Company Name | Job card |
| `company_logo` | `companyLogo` | Company Logo URL | Job card image |
| `job_description` | `jobDescription` | Job Description | Job detail |
| `job_type` | `jobType` | Job Type (Full-time...) | Badge, filter |
| `experience_level` | `experienceLevel` | Experience Level | Badge, filter |
| `category` | `category` | Category | Filter |
| `required_skills` (text[]) | `requiredSkills` | Required Skills (comma) | Skill chips |
| `location` | `location` | Location | Card, location search |
| `salary_min`, `salary_max` | `salaryMin`, `salaryMax` | Min / Max Salary | "60K - 90K" |
| `deadline` | `deadline` | Application Deadline | "Deadline: ..." |
| `openings` | `openings` | Number of Openings | Job detail |
| `is_test_required` | `isTestRequired` | Technical assessment checkbox | "No Test Required" |
| `contact_email` | `contactEmail` | Contact Email | Apply email isi pe jati hai |
| `apply_link` | `applyLink` | External Apply Link | Job detail |
| `status` | `status` | — (default `active`) | Sirf `active` jobs list mein |
| `views` | `views` | — | Job detail kholne pe +1 |

### 3.5 `applications`

| Column | Frontend field | Kahan se aata hai |
|--------|----------------|-------------------|
| `job_id` (FK → jobs) | `jobId` | Job detail page ka job |
| `applicant_id` (FK → accounts) | `applicantId` | Logged-in user |
| `cover_letter` | `coverLetter` | Apply form → Cover Letter |
| `resume` | `resume` | Apply form → resume file ka naam |
| `status` | `status` | Default `pending`; recruiter dropdown se badalta hai |
| `name`, `email`, `phone`, `skills`, `bio`, `education` | same naam | Apply form fields (`customFields`) |
| `job_title`, `company_name`, `location` | same (camelCase) | Apply ke waqt job se copy (snapshot) |
| `applicant_score` | `applicantScore` | — (labs ke liye) |
| `applied_at` | `appliedAt` | Khud: "Applied 11/22/2026" |

**Snapshot kyun?** Agar recruiter baad mein job ka title badal de, purani application mein wahi title rahe jis pe apply kiya tha.

### 3.6 `saved_jobs`, `companies`, `sessions`

| Table | Columns | Frontend |
|-------|---------|----------|
| `saved_jobs` | `account_id`, `job_id`, `created_at` | Jobs page ka bookmark button |
| `companies` | `name`, `slug`, `industry`, `location`, `logo_url`→`logo`, `size`, `website`, `description` | Companies page cards |
| `sessions` | `account_id`, `token_hash`, `expires_at`, `revoked_at`, `user_agent`, `ip_address` | Koi UI nahi; login yaad rakhne ke liye |

---

## 4. Har feature: kaunsi file → kaunsi table

Format: **Page file** → `fetch` → **API file** → **lib** → **SQL jaisa kaam**

### 4.1 Sign up
1. `src/app/sign-up/page.js` form → `src/context/AuthContext.js` `signup()`
2. `POST /api/auth/signup` → `src/app/api/auth/signup/route.js`
3. `src/lib/password.js` password ko hash karta hai
4. `SELECT id FROM accounts WHERE email = ?` (pehle se hai?)
5. `INSERT INTO accounts (email, password_hash, full_name, role)`
6. **Triggers** khud chalte hain: `INSERT INTO profiles` aur `INSERT INTO user_settings`
7. `src/lib/auth.js` `createSession()` → `INSERT INTO sessions` + cookie

### 4.2 Login / logout / "kaun logged in hai"
| Kaam | API file | Database |
|------|----------|----------|
| Login | `api/auth/login/route.js` | `SELECT password_hash FROM accounts WHERE email=?` → `INSERT INTO sessions` |
| Har page pe user | `api/auth/me/route.js` → `lib/auth.js` | `sessions` (token_hash match) → `accounts` JOIN `profiles`, `user_settings` |
| Logout | `api/auth/logout/route.js` | `UPDATE sessions SET revoked_at = now()` |
| Protected page | `src/middleware.js` | Database nahi; sirf cookie ka JWT check |

### 4.3 Jobs dekhna / search
1. `src/app/jobs/page.js` → `fetch('/api/jobs?search=React&location=Lahore&page=1')`
2. `src/app/api/jobs/route.js` `GET`:
   `SELECT ... FROM jobs JOIN accounts ON accounts.id = jobs.recruiter_id WHERE status='active' AND (job_title ILIKE '%React%' OR ...) AND location ILIKE '%Lahore%' ORDER BY created_at DESC LIMIT 10`
3. `lib/mappers.js` `jobRowToApi()` → `job_title` ko `jobTitle` banata hai
4. `src/components/JobCard.js` card dikhata hai

### 4.4 Job detail
`src/app/jobs/[id]/page.js` → `GET /api/jobs/<id>` → `src/app/api/jobs/[id]/route.js` → `SELECT ... FROM jobs WHERE id=?` + `increment_job_views()` (SQL function, `views + 1`)

### 4.5 Job post karna (recruiter)
1. `src/components/JobPostModal.js` form → `src/app/dashboard/page.js` → `POST /api/jobs`
2. `src/app/api/jobs/route.js` `POST`:
   - Login check (`lib/auth.js`)
   - Company: `SELECT id FROM companies WHERE slug='workoura-tech'` → na mile to `INSERT INTO companies`
   - `lib/mappers.js` `jobApiToRow()` → form fields ko columns mein badalta hai
   - `INSERT INTO jobs (recruiter_id, company_id, job_title, ...)`
3. Edit: `PUT /api/jobs/<id>` → `UPDATE jobs`. Delete: `DELETE /api/jobs/<id>` → `DELETE FROM jobs` (cascade: applications + saved_jobs bhi)

### 4.6 Apply karna (job seeker)
1. `src/app/jobs/[id]/page.js` Apply form → `POST /api/applications` with `{ jobId, coverLetter, resume, customFields: { name, email, phone, skills, bio, education } }`
2. `src/app/api/applications/route.js` → `src/lib/applications.js` `createApplication()`:
   - `SELECT status, recruiter_id FROM jobs WHERE id=?` (active? apni job to nahi?)
   - `INSERT INTO applications (job_id, applicant_id, cover_letter, status, name, email, ..., job_title, company_name, location)`
   - Do baar apply → unique index error `23505` → "pehle hi apply kar chuke hain"
3. Phir `POST /api/apply` → recruiter ko email (database nahi)

### 4.7 Applications dekhna + status badalna
| Kaam | File | Database |
|------|------|----------|
| Seeker: meri applications | `api/applications/route.js` `GET` | `SELECT ... FROM applications WHERE applicant_id = me` |
| Recruiter: meri jobs ki applications | same | `SELECT id FROM jobs WHERE recruiter_id = me` → `... WHERE job_id IN (...)` |
| Ek job ki applications | `GET /api/applications?jobId=` | `WHERE job_id = ?` (sirf us job ka recruiter) |
| Status dropdown | `api/applications/[id]/route.js` `PATCH` | `jobs.recruiter_id` check → `UPDATE applications SET status=?` |

Har application ke saath JOIN aata hai (`lib/applications.js` → `APPLICATION_SELECT`):
`applications.job_id → jobs` (title, salary) aur `applications.applicant_id → accounts → profiles` (naam, skills).

### 4.8 Dashboard stats / My Jobs
`src/app/dashboard/page.js` → `GET /api/dashboard` → `src/app/api/dashboard/route.js` → `SELECT *, (SELECT count(*) FROM applications WHERE job_id = jobs.id) FROM jobs WHERE recruiter_id = me`

### 4.9 Profile + settings
`src/app/dashboard/page.js` (Profile tab) → `GET/PUT /api/users` → `src/app/api/users/route.js` → `src/lib/accounts.js`:
- `UPDATE accounts SET full_name, role`
- `UPSERT profiles (phone, bio, skills, location, education ...)`
- `UPSERT user_settings (email_notifications, job_alerts ...)`

### 4.10 Save job
`src/app/jobs/page.js` bookmark → `POST` / `DELETE /api/jobs/<id>/save` → `src/app/api/jobs/[id]/save/route.js` → `INSERT ... ON CONFLICT (account_id, job_id) DO UPDATE` / `DELETE FROM saved_jobs WHERE account_id=? AND job_id=?`

### 4.11 Companies page
`src/app/companies/page.js` → `GET /api/companies` → `src/app/api/companies/route.js` → `SELECT * FROM companies` + `SELECT * FROM jobs WHERE status='active'` → jobs ko `jobs.company_id = companies.id` se company ke neeche jodta hai

---

## 5. Database ke andar automatic cheezein (`sql/schema.sql`)

| Naam | Type | Kab chalta hai | Kya karta hai |
|------|------|----------------|---------------|
| `set_updated_at()` | function + 6 triggers | Har UPDATE pe (accounts, profiles, user_settings, companies, jobs, applications) | `updated_at = now()` |
| `create_profile_for_account()` | trigger | `INSERT INTO accounts` ke baad | Khali `profiles` row banata hai |
| `create_settings_for_account()` | trigger | `INSERT INTO accounts` ke baad | Default `user_settings` row |
| `increment_job_views(p_job_id)` | function | Job detail page khulne pe (API se `rpc`) | `jobs.views + 1` |
| `purge_expired_sessions()` | function | Manually | Expired sessions delete |
| `job_application_counts` | view | — | Har job ki application count (sirf server) |
| RLS policies | security | Public key se read | Sirf `active` jobs aur companies public; baaki sab band |

---

## 6. Saari files ek nazar mein

| File | Database se kya rishta |
|------|------------------------|
| `src/lib/supabase.js` | **Connection** banata hai (URL + key) |
| `src/lib/mappers.js` | `snake_case` ↔ `camelCase` (jobs, applications, companies) |
| `src/lib/auth.js` | `sessions`, `accounts` (+ profiles, settings join), cookie |
| `src/lib/accounts.js` | Profile update: `accounts`, `profiles`, `user_settings` |
| `src/lib/applications.js` | Apply: `jobs` check, `applications` insert, JOIN list |
| `src/lib/password.js`, `jwt.js` | Database nahi; hashing aur token |
| `src/app/api/auth/*` | `accounts`, `sessions` |
| `src/app/api/jobs/route.js` | `jobs` (list, create), `companies` (find/create) |
| `src/app/api/jobs/[id]/route.js` | Ek `jobs` row: read, update, delete, views |
| `src/app/api/jobs/[id]/save/route.js` | `saved_jobs` |
| `src/app/api/applications/*` | `applications` (+ `jobs` owner check) |
| `src/app/api/dashboard/route.js` | Recruiter ki `jobs` + application count |
| `src/app/api/companies/route.js` | `companies` + active `jobs` |
| `src/app/api/users/route.js` | `accounts`, `profiles`, `user_settings` |
| `src/app/api/apply/route.js` | Database **nahi**; sirf email |
| `src/context/AuthContext.js` | Auth APIs call karta hai; user poori site ko deta hai |
| `src/middleware.js` | Database **nahi**; cookie check karke redirect |
| `sql/schema.sql` | Saari tables, FKs, triggers, RLS |

---

## 7. Viva mein poochne wale sawal

- **Frontend database se kaise connect hota hai?** Seedha nahi. Page `fetch('/api/...')` karta hai, API route `getSupabaseAdmin()` (`src/lib/supabase.js`) se query chalata hai.
- **`jobTitle` aur `job_title` mein farq?** Same cheez. DB `snake_case`, JavaScript `camelCase`. `src/lib/mappers.js` badalta hai.
- **Recruiter aur job kaise jude hain?** `jobs.recruiter_id` FK → `accounts.id` (1:N).
- **Kisne kis job pe apply kiya, kaise pata chalta hai?** `applications` table: `job_id` → `jobs`, `applicant_id` → `accounts`. M:N relationship.
- **Signup pe profile kaun banata hai?** Database trigger `create_profile_for_account()`, code nahi.
- **Job delete ho to applications ka kya hota hai?** `ON DELETE CASCADE`, wo bhi delete.
- **Do baar apply kyun nahi hota?** `(job_id, applicant_id)` pe unique index.
- **Recruiter doosre ki application ka status kyun nahi badal sakta?** API pehle `jobs.recruiter_id` ko logged-in user se match karta hai, warna 403.
