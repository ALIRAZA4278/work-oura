# WorkOura: Job Board

A full-stack job board built with Next.js and **Supabase (PostgreSQL)**, with a
**custom email + password login** (no third-party auth provider).

- **Live site:** https://work-oura-jobs.netlify.app
- **Demo login:** `aliadmin@gmail.com` / `AliAdmin@123` (recruiter account with sample data)
- **Docs:** [`PROJECT_NOTES.md`](PROJECT_NOTES.md) (project overview) ·
  [`DATABASE_GUIDE.md`](DATABASE_GUIDE.md) (which file talks to which table and column) ·
  [`sql/VIVA_NOTES.md`](sql/VIVA_NOTES.md) (DBMS lab notes)

## Features

- **Accounts**: email/password sign up and login (scrypt password hashing + JWT session cookie)
- **Roles**: job seeker and recruiter
- **Jobs**: browse, search, filter, sort and bookmark jobs
- **Applications**: job seekers apply; recruiters review and change the status
- **Recruiter dashboard**: post, edit and delete jobs, see applications per job
- **Job seeker dashboard**: track applications and edit the profile
- **Responsive design** with Tailwind CSS

## Tech stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL) via `@supabase/supabase-js`
- **Auth**: custom, `scrypt` password hashing + HS256 JWT session cookie
- **UI**: Tailwind CSS, Lucide icons, Framer Motion
- **Hosting**: Netlify

## Getting started

### Prerequisites

- Node.js 18+
- A free Supabase project (https://supabase.com)

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Create the database**: paste `sql/schema.sql` into the Supabase SQL Editor and
   run it once (details in [`sql/README.md`](sql/README.md)). The DBMS lab queries
   are in `sql/ALL_IN_ONE.sql`.
4. **Environment variables**: copy `.env.example` to `.env.local` and fill it in:
   ```env
   # Supabase (Project Settings -> API)
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Session JWT signing key (at least 32 characters)
   # node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   AUTH_SECRET=your_random_secret

   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Application email notifications (optional, Gmail SMTP)
   NM_EMAIL_USER=
   NM_EMAIL_PW=
   ```
   > `SUPABASE_SERVICE_ROLE_KEY` is used only on the server and bypasses RLS.
   > Never put it in client code or a public repository.
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open http://localhost:3000/sign-up, create an account and try it out.

## How authentication works

1. **Sign up**: `POST /api/auth/signup` hashes the password with `scrypt` and inserts
   it into the `accounts` table. Database triggers then create the `profiles` and
   `user_settings` rows.
2. **Login**: `POST /api/auth/login` verifies the password, creates an HS256 JWT,
   sets it in the `wk_session` httpOnly cookie, and stores its SHA-256 hash in the
   `sessions` table.
3. **Every request**: `getCurrentAccount()` verifies the cookie *and* checks the
   `sessions` row, so logout and revocation take effect immediately.
4. **Logout**: `POST /api/auth/logout` revokes the session row and clears the cookie.
5. **Middleware** (`src/middleware.js`) only checks the JWT signature (Edge runtime,
   no database call) and redirects protected routes like `/dashboard` to `/sign-in`.

## Project structure

```
sql/
├── schema.sql             # Database: tables, foreign keys, triggers, RLS
├── ALL_IN_ONE.sql         # All DBMS lab queries in one file
└── labs/                  # The same lab queries, one file per lab
src/
├── app/
│   ├── api/
│   │   ├── auth/          # signup / login / logout / me
│   │   ├── jobs/          # Job list, create, read, update, delete, save
│   │   ├── users/         # Profile + settings
│   │   ├── applications/  # Apply, list, change status
│   │   ├── companies/     # Companies and their jobs
│   │   ├── dashboard/     # A recruiter's own jobs
│   │   └── apply/         # Application email to the recruiter
│   ├── sign-in/           # Login form
│   ├── sign-up/           # Sign-up form
│   ├── jobs/              # Job list and job detail pages
│   ├── companies/         # Companies page
│   ├── dashboard/         # User dashboard
│   ├── about/             # About page
│   ├── layout.js          # Root layout with AuthProvider
│   └── page.js            # Home page
├── components/            # Navbar, Footer, JobCard, JobFilters, JobPostModal
├── context/
│   └── AuthContext.js     # Logged-in user for the whole site (useAuth / useUser)
├── lib/
│   ├── supabase.js        # Database connection (admin + browser clients)
│   ├── auth.js            # Sessions, getCurrentAccount
│   ├── authConstants.js   # Cookie name + max age (Edge-safe)
│   ├── jwt.js             # HS256 JWT (Web Crypto, works in Node and Edge)
│   ├── password.js        # scrypt hash / verify / rules
│   ├── accounts.js        # Profile + settings updates
│   ├── applications.js    # Apply-to-job logic
│   └── mappers.js         # snake_case <-> camelCase mapping
└── middleware.js          # Route protection
```

Every source file starts with a comment that says what it does and which
tables it uses.

## API endpoints

### Auth
- `POST /api/auth/signup`: create an account
- `POST /api/auth/login`: log in
- `POST /api/auth/logout`: log out (revokes the session)
- `GET /api/auth/me`: the current user, or `null`

### Jobs
- `GET /api/jobs`: active jobs with filtering, sorting and pagination
- `POST /api/jobs`: create a job (login required)
- `GET /api/jobs/[id]`: one job (also increases its view count)
- `PUT /api/jobs/[id]`: update a job (owner only)
- `DELETE /api/jobs/[id]`: delete a job (owner only)
- `POST` / `DELETE /api/jobs/[id]/save`: bookmark / remove bookmark
- `GET /api/dashboard`: the logged-in recruiter's own jobs

### Users
- `GET /api/users`: current user profile
- `PUT /api/users`: update name, role, profile and settings

### Applications
- `GET /api/applications`: my applications (job seeker) or applications to my jobs (recruiter)
- `POST /api/applications`: submit an application
- `GET /api/applications/[id]`: one application
- `PATCH /api/applications/[id]`: change the status (only the job's recruiter)

### Companies
- `GET /api/companies`: companies with their active jobs and open positions

## Database schema

Full details are in `sql/` and [`DATABASE_GUIDE.md`](DATABASE_GUIDE.md). Short version:

| Table | Purpose |
|-------|---------|
| `accounts` | email, password hash, full name, role |
| `sessions` | login sessions (token hash, expiry, revoke) |
| `password_reset_tokens`, `email_verification_tokens` | auth flows (not used by the UI yet) |
| `profiles` | phone, bio, skills, education, links |
| `user_settings` | notification / visibility toggles |
| `companies` | company directory |
| `jobs` | job posts (recruiter, salary, skills, status, views) |
| `applications` | one application per user per job (unique) |
| `saved_jobs` | bookmarks |
