# WorkOura Job Board: Group Notes

- **Live website:** https://work-oura-jobs.netlify.app
- **Code:** https://github.com/ALIRAZA4278/work-oura
- **Database:** Supabase (PostgreSQL)
- **Demo login:** `aliadmin@gmail.com` / `AliAdmin@123` (details in section 2)
- **Database ↔ code guide:** `DATABASE_GUIDE.md` / `.html` (which file is connected to which table and field)

These notes help every group member understand what the project is, how it works, and what to say in the viva. The SQL / DBMS lab details are in `sql/VIVA_NOTES.md`.

---

## 1. What is the project? (1-minute version)

A **job board website**, like Rozee.pk or Indeed. It has two kinds of users:

| User | What they can do |
|------|------------------|
| **Job Seeker** (looking for a job) | Browse, search and filter jobs, save jobs, apply, track the status of their applications |
| **Recruiter** (hiring for a company) | Post jobs, manage their jobs, see applications, change the status (pending → reviewing → interview → hired / rejected) |

All data (users, jobs, applications) is stored in a **PostgreSQL database** running on Supabase.

---

## 2. How to try the website

### Ready-made login (with sample data)

| Field | Value |
|-------|-------|
| **Email** | `aliadmin@gmail.com` |
| **Password** | `AliAdmin@123` |
| **Role** | Recruiter |

This account already has:

| Job (WorkOura Tech) | Applications |
|---------------------|--------------|
| React Developer (Lahore, Full-time) | 3: Ali Raza *(interview)*, Ayesha Noor *(reviewing)*, Zain Ahmed *(pending)* |
| UI/UX Designer (Remote) | 2: Hina Malik *(hired)*, Noor Fatima *(rejected)* |
| Database Administrator (Karachi, Contract) | 1: Ali Raza *(pending)* |
| Web Development Intern (Islamabad) | 2: Zain Ahmed *(reviewing)*, Noor Fatima *(pending)* |

Log in and open the **Dashboard** to see the jobs, the applications and their status, and to change a status. The account has also saved 2 jobs.

### Create your own accounts and test the full flow

1. Open https://work-oura-jobs.netlify.app.
2. Go to **Sign Up** and create an account. Choose a role: *Job Seeker* or *Recruiter*.
3. With the **Recruiter** account: Dashboard → post a job.
4. In another browser or an incognito window, create a **Job Seeker** account → Jobs page → open that job → **Apply**.
5. Go back to the recruiter dashboard → the application is there → change its status.
6. The seeker's dashboard shows the new status.

> Apart from `aliadmin@gmail.com`, the demo accounts (`ahmed.khan@demo.pk`, `ali.raza@demo.pk`, etc.) **cannot log in**. Their passwords are deliberately fake because they exist only for the SQL lab results. Create your own account for testing.

---

## 3. Technology (what each part is for)

| Part | Job |
|------|-----|
| **Next.js 15** (React) | The website pages (frontend) **and** the server API routes (backend), in one project |
| **Tailwind CSS** | Styling / design |
| **Supabase** | Hosted PostgreSQL database |
| **supabase-js** | Library the server uses to talk to the database |
| **Netlify** | Hosts the website on the internet |
| **GitHub** | Stores the code and its history |

---

## 4. How the system works

```
 User's browser             Netlify (Next.js server)            Supabase
 ───────────────           ────────────────────────           ──────────
  React pages   ── fetch ─▶  /api/... routes   ── SQL ──▶   PostgreSQL tables
  (jobs, login,  ◀─ JSON ──  (login check,     ◀─ rows ──   (accounts, jobs,
   dashboard)                 validation)                    applications...)
```

**Example: what happens when you click "Apply"?**

1. The browser sends `POST /api/applications` (job id, cover letter, skills, etc.).
2. The server reads the cookie to check that the user is logged in.
3. The server checks: is the job active? Is it the user's own job? Have they already applied?
4. If everything is fine, one row is **INSERTed** into the `applications` table.
5. The server sends back "success" → the screen shows "Application submitted".

**Important rule:** the browser **never talks to the database directly**. Everything goes through the server (API routes). That way the database's secret key stays on the server and never reaches the user's browser.

---

## 5. Folder structure (the files that matter)

```
work-oura/
├── src/
│   ├── app/                  ← every folder = one page / URL
│   │   ├── page.js           ← Home page  (/)
│   │   ├── jobs/             ← Jobs list (/jobs) + job detail (/jobs/[id])
│   │   ├── companies/        ← Companies page
│   │   ├── dashboard/        ← User dashboard (seeker + recruiter)
│   │   ├── sign-in/ sign-up/ ← Login / sign-up pages
│   │   ├── about/            ← About page
│   │   └── api/              ← BACKEND: server routes (database access happens here)
│   ├── components/           ← Navbar, Footer, JobCard, JobFilters, JobPostModal
│   ├── context/AuthContext.js← Shares the logged-in user with the whole site
│   ├── lib/                  ← Helpers: database connection, auth, password, JWT
│   └── middleware.js         ← Sends logged-out users from /dashboard to /sign-in
├── sql/
│   ├── schema.sql            ← The whole database structure (tables, triggers, security)
│   ├── ALL_IN_ONE.sql        ← DBMS lab queries (lab00 – lab09)
│   ├── labs/                 ← The same lab queries, one file per lab
│   └── VIVA_NOTES.md / .pdf  ← SQL viva notes
└── .env.local                ← Secret keys (NOT pushed to GitHub)
```

Every code file starts with a comment that explains what it does.

---

## 6. Database tables

| Table | What it stores |
|-------|----------------|
| `accounts` | Users: email, password hash, name, role |
| `sessions` | Who logged in and when (closed on logout) |
| `profiles` | Skills, bio, resume (one per account) |
| `user_settings` | Dashboard settings toggles |
| `companies` | Company information |
| `jobs` | Job posts: title, salary, location, status |
| `applications` | Which seeker applied to which job + status |
| `saved_jobs` | Bookmarked jobs |
| `password_reset_tokens`, `email_verification_tokens` | Created for future features |

**Relationships:**
- One recruiter → many jobs (1 : N)
- One company → many jobs (1 : N)
- Seekers ↔ Jobs = M : N, through the `applications` table
- Account ↔ Profile = 1 : 1 (as soon as an account is created, a **trigger** creates its profile and settings)

---

## 7. How login works

We built our own login system (we do not use Supabase Auth):

1. **Sign up:** the password is hashed with **scrypt** before it is saved. The real password is never stored.
2. **Login:** if the password matches, the server creates a **JWT token** and puts it in an **httpOnly cookie** (valid for 7 days). JavaScript on the page cannot read this cookie.
3. On every request the server checks the cookie and looks in the `sessions` table to confirm the session is still valid.
4. **Logout:** the session is revoked and the cookie is deleted.

---

## 8. Security (always asked in the viva)

| Risk | What we did |
|------|-------------|
| The database leaks | Passwords are hashed, so the real passwords cannot be recovered |
| Someone reads another user's data | **RLS** + `REVOKE` on private tables. The public key can only read active jobs and companies |
| SQL injection | supabase-js sends values as parameters, and search text is cleaned |
| A seeker sets their own status to "hired" | The server checks that only that job's recruiter can change the status (otherwise error 403) |
| Applying twice to the same job | **Unique index** on (job + applicant) in the database |
| Secret keys end up on GitHub | `.env.local` is in `.gitignore`. The keys live only in the Netlify settings |

---

## 9. How to run the project on your computer

```bash
git clone https://github.com/ALIRAZA4278/work-oura
cd work-oura
npm install
# copy .env.example to .env.local and fill in the keys (ask the group leader)
npm run dev
# open http://localhost:3000 in the browser
```

`.env.local` needs these 5 values:

| Variable | What it is |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | The Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (publishable) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key: **never share it** |
| `AUTH_SECRET` | Random secret for signing login tokens (32+ characters) |
| `NEXT_PUBLIC_APP_URL` | The website address |

---

## 10. Deployment

- The code is on **GitHub** → **Netlify** builds it (`npm run build`) → the website goes live.
- The 5 environment variables above are set in Netlify.
- The database was created once by running `sql/schema.sql` in the Supabase SQL Editor.

---

## 11. What does not work yet (honest list)

- **Email to the recruiter after an application:** the code exists, but the Gmail credentials (`NM_EMAIL_USER`, `NM_EMAIL_PW`) are not set, so no email is sent. The application is still saved.
- **Forgot password / email verification:** the tables exist, but the pages are not built yet.

---

## 12. Common viva questions

- **What does the project do?** A job board that connects job seekers and recruiters. Recruiters post jobs, seekers apply, recruiters update the status.
- **What are the frontend and the backend?** Both are in Next.js. The pages in `src/app/*` are the frontend; `src/app/api/*` is the backend.
- **Which database and why?** PostgreSQL (Supabase). The data is relational (users ↔ jobs ↔ applications), so tables and foreign keys fit best.
- **How is the password stored?** scrypt hash + random salt. The real password is never stored.
- **How does the site remember the login?** A JWT token in an httpOnly cookie, plus a record in the `sessions` table.
- **Why doesn't the browser talk to the database directly?** So the secret key and private data stay on the server.
- **Example of a trigger?** When a new account is created, its `profiles` and `user_settings` rows are created automatically. `updated_at` is also set by a trigger.
- **Where is the M:N relationship?** Seekers ↔ Jobs, through the `applications` table (two foreign keys).
- **Where is it hosted?** The website on Netlify, the database on Supabase, the code on GitHub.
