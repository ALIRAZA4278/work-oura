# JobBoard - Job Posting Platform

A full-stack job posting platform built with Next.js, **Supabase (PostgreSQL)**, and a
**custom email + password authentication** system (no third-party auth provider).

## Features

- **User Authentication**: Apna email/password signup + login (bcrypt-style scrypt hashing + JWT session cookie)
- **Role-based Access**: Job Seeker and Recruiter roles
- **Job Listings**: Browse, search, and filter jobs
- **Job Details**: Detailed job information with application functionality
- **Applications**: Job seekers can apply to jobs
- **Recruiter Dashboard**: Post, edit, and manage job listings
- **Job Seeker Dashboard**: View applications and manage profile
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL) via `@supabase/supabase-js`
- **Authentication**: Custom — `scrypt` password hashing + HS256 JWT session cookie
- **UI/UX**: Tailwind CSS, Lucide Icons, Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- A free Supabase project (https://supabase.com)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. **Database banayein** — `sql/schema.sql` ko Supabase SQL Editor me paste
   karke ek baar Run karein (details: [`sql/README.md`](sql/README.md)).
   DBMS lab queries `sql/ALL_IN_ONE.sql` me hain.

4. Environment variables — `.env.example` ko `.env.local` me copy karke bhar dein:

   ```env
   # Supabase (Project Settings -> API)
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Session JWT signing key (kam se kam 32 characters)
   # node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   AUTH_SECRET=your_random_secret

   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Email notifications (optional)
   RESEND_API_KEY=
   NM_EMAIL_USER=
   NM_EMAIL_PW=
   ```

   > `SUPABASE_SERVICE_ROLE_KEY` sirf server pe use hoti hai aur RLS bypass karti hai —
   > ise kabhi client code ya public repo me mat daalein.

5. Start the development server:
   ```bash
   npm run dev
   ```

6. `/sign-up` pe ja kar account banayein aur test karein.

## How authentication works

1. **Signup** — `POST /api/auth/signup` password ko `scrypt` se hash karke `accounts` table me daalta hai
   (triggers automatically `profiles` aur `user_settings` rows bana dete hain).
2. **Login** — `POST /api/auth/login` password verify karke ek HS256 JWT banata hai,
   use `wk_session` httpOnly cookie me set karta hai, aur uska SHA-256 hash `sessions` table me store karta hai.
3. **Har request** — server `getCurrentAccount()` se cookie verify karta hai *aur* `sessions` row
   check karta hai (isliye logout / revoke turant asar karta hai).
4. **Logout** — `POST /api/auth/logout` session row revoke karke cookie clear kar deta hai.
5. **Middleware** (`src/middleware.js`) sirf JWT signature check karta hai (Edge runtime, koi DB call nahi)
   aur `/dashboard` jaise protected routes ko `/sign-in` pe redirect karta hai.

## Project Structure

```
sql/                       # Har part ki alag SQL file (accounts, login, jobs, ...)
src/
├── app/
│   ├── api/
│   │   ├── auth/          # signup / login / logout / me
│   │   ├── jobs/          # Job endpoints
│   │   ├── users/         # Profile + settings
│   │   ├── applications/  # Application management
│   │   ├── companies/     # Companies + unki jobs
│   │   └── dashboard/     # Recruiter ki apni jobs
│   ├── sign-in/           # Custom login form
│   ├── sign-up/           # Custom signup form
│   ├── jobs/              # Job listing and detail pages
│   ├── dashboard/         # User dashboard
│   ├── layout.js          # Root layout with AuthProvider
│   └── page.js            # Homepage
├── components/            # Reusable UI components
├── context/
│   └── AuthContext.js     # Client-side auth state (useAuth / useUser)
├── lib/
│   ├── supabase.js        # Supabase clients (admin + browser)
│   ├── auth.js            # Session create/destroy, getCurrentAccount
│   ├── authConstants.js   # Cookie name + max age (Edge-safe)
│   ├── jwt.js             # HS256 JWT (Web Crypto — Node + Edge dono)
│   ├── password.js        # scrypt hash / verify / validation
│   ├── accounts.js        # Profile + settings updates
│   ├── applications.js    # Shared "apply to job" logic
│   ├── mappers.js         # snake_case <-> camelCase mapping
└── middleware.js          # Route protection
```

## API Endpoints

### Auth
- `POST /api/auth/signup` - Naya account banayein
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout (session revoke)
- `GET /api/auth/me` - Current session ka user (ya `null`)

### Jobs
- `GET /api/jobs` - Get all active jobs with filtering, sorting, pagination
- `POST /api/jobs` - Create new job (login required)
- `GET /api/jobs/[id]` - Get specific job details (view count bhi badhata hai)
- `PUT /api/jobs/[id]` - Update job (owner only)
- `DELETE /api/jobs/[id]` - Delete job (owner only)
- `GET /api/dashboard` - Logged-in recruiter ki apni jobs

### Users
- `GET /api/users` - Current user profile
- `PUT /api/users` - Update name / role / profile / settings

### Applications
- `GET /api/applications` - Apni applications (job seeker) ya apni jobs ki applications (recruiter)
- `POST /api/applications` - Submit job application
- `GET /api/applications/[id]` - Ek application
- `PATCH /api/applications/[id]` - Status update (sirf job ka recruiter)

### Companies
- `GET /api/companies` - Companies + unki active jobs aur open positions

## Database Schema

Poori tafseel `sql/` folder me hai. Short version:

| Table | Kis liye |
|-------|----------|
| `accounts` | email, password hash, full name, role |
| `sessions` | login sessions (token hash, expiry, revoke) |
| `password_reset_tokens`, `email_verification_tokens` | auth flows |
| `profiles` | phone, bio, skills, education, links |
| `user_settings` | notification / visibility toggles |
| `companies` | company directory |
| `jobs` | job posts (recruiter, salary, skills, status, views) |
| `applications` | ek job pe ek user ki ek application (unique) |
| `saved_jobs` | bookmarks |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
