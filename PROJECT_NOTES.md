# WorkOura Job Board: Group Notes

- **Live website:** https://work-oura-jobs.netlify.app
- **Code:** https://github.com/ALIRAZA4278/work-oura
- **Database:** Supabase (PostgreSQL)
- **Demo login:** `aliadmin@gmail.com` / `AliAdmin@123` (detail section 2 mein)

Ye notes is liye hain taake group ka har member samajh sake ke project kya hai, kaise kaam karta hai, aur viva mein kya bolna hai. SQL / DBMS labs ki detail `sql/VIVA_NOTES.md` mein hai.

---

## 1. Project kya hai? (1 minute version)

Ek **job board website**, jaise Rozee.pk ya Indeed. Do tarah ke users hain:

| User | Kya kar sakta hai |
|------|-------------------|
| **Job Seeker** (naukri dhoondne wala) | Jobs dekhna, search/filter karna, job save karna, apply karna, apni applications ka status dekhna |
| **Recruiter** (company wala) | Job post karna, apni jobs manage karna, applications dekhna, status badalna (pending → reviewing → interview → hired / rejected) |

Sab data (users, jobs, applications) ek **PostgreSQL database** mein save hota hai jo Supabase pe chal raha hai.

---

## 2. Website try kaise karein

### Ready-made login (dummy data ke saath)

| Field | Value |
|-------|-------|
| **Email** | `aliadmin@gmail.com` |
| **Password** | `AliAdmin@123` |
| **Role** | Recruiter |

Is account mein pehle se ye data hai:

| Job (WorkOura Tech) | Applications |
|---------------------|--------------|
| React Developer (Lahore, Full-time) | 3: Ali Raza *(interview)*, Ayesha Noor *(reviewing)*, Zain Ahmed *(pending)* |
| UI/UX Designer (Remote) | 2: Hina Malik *(hired)*, Noor Fatima *(rejected)* |
| Database Administrator (Karachi, Contract) | 1: Ali Raza *(pending)* |
| Web Development Intern (Islamabad) | 2: Zain Ahmed *(reviewing)*, Noor Fatima *(pending)* |

Login karke **Dashboard** pe jao. Wahan apni jobs, applications aur unka status nazar aayega, aur status badal bhi sakte ho. Is account ne 2 jobs save bhi ki hui hain.

### Apna account bana ke poora flow dekhna

1. https://work-oura-jobs.netlify.app kholo.
2. **Sign Up** pe jao aur account banao. Role chuno: *Job Seeker* ya *Recruiter*.
3. **Recruiter** account se: Dashboard → job post karo.
4. Doosre browser / incognito mein **Job Seeker** account banao → Jobs page → wo job kholo → **Apply**.
5. Recruiter dashboard pe wapas jao → application nazar aayegi → status badlo.
6. Seeker ke dashboard pe naya status dikhega.

> `aliadmin@gmail.com` ke ilawa demo data wale accounts (`ahmed.khan@demo.pk`, `ali.raza@demo.pk` waghera) **login nahi ho sakte**. Unka password jaan boojh kar fake rakha gaya hai, wo sirf SQL labs ke results ke liye hain. Test ke liye apna account banao.

---

## 3. Technology (kaunsi cheez kis liye)

| Cheez | Kaam |
|-------|------|
| **Next.js 15** (React) | Website ke pages (frontend) **aur** server ke API routes (backend), dono ek hi project mein |
| **Tailwind CSS** | Styling / design |
| **Supabase** | Online PostgreSQL database |
| **supabase-js** | Library jis se server database se baat karta hai |
| **Netlify** | Website ko internet pe host karta hai |
| **GitHub** | Code store hota hai, version history |

---

## 4. System kaise kaam karta hai

```
 User ka Browser            Netlify (Next.js server)            Supabase
 ───────────────           ────────────────────────           ──────────
  React pages   ── fetch ─▶  /api/... routes   ── SQL ──▶   PostgreSQL tables
  (jobs, login,  ◀─ JSON ──  (login check,     ◀─ rows ──   (accounts, jobs,
   dashboard)                 validation)                    applications...)
```

**Example: "Apply" button dabane pe kya hota hai?**

1. Browser `POST /api/jobs/<id>/apply` bhejta hai (cover letter, skills waghera).
2. Server cookie se check karta hai ke user logged in hai.
3. Server check karta hai: job active hai? apni hi job to nahi? pehle apply to nahi kiya?
4. Sab theek → `applications` table mein ek row **INSERT** hoti hai.
5. Server "success" wapas bhejta hai → screen pe "Application submitted" aata hai.

**Important rule:** browser **kabhi seedha database se baat nahi karta**. Har cheez server (API route) ke through jati hai. Is liye database ki secret key sirf server ke paas hoti hai, user ke browser mein nahi.

---

## 5. Folder structure (sirf kaam ki files)

```
work-oura/
├── src/
│   ├── app/                  ← har folder = ek page / URL
│   │   ├── page.js           ← Home page  (/)
│   │   ├── jobs/             ← Jobs list (/jobs) + job detail (/jobs/[id])
│   │   ├── companies/        ← Companies page
│   │   ├── dashboard/        ← User dashboard (seeker + recruiter)
│   │   ├── sign-in/ sign-up/ ← Login / Signup pages
│   │   ├── about/            ← About page
│   │   └── api/              ← BACKEND: server routes (database yahan se)
│   ├── components/           ← Navbar, Footer, JobCard, JobFilters, JobPostModal
│   ├── context/AuthContext.js← Logged-in user ki info poori site mein share karta hai
│   ├── lib/                  ← Helpers: supabase connection, auth, password, JWT
│   └── middleware.js         ← Bina login /dashboard pe jao to /sign-in pe bhej deta hai
├── sql/
│   ├── schema.sql            ← Poora database structure (tables, triggers, security)
│   ├── ALL_IN_ONE.sql        ← DBMS lab queries (lab00 – lab09)
│   ├── labs/                 ← Wahi lab queries alag alag files mein
│   └── VIVA_NOTES.md / .pdf  ← SQL viva notes
└── .env.local                ← Secret keys (GitHub pe NAHI jati)
```

---

## 6. Database tables

| Table | Kya store karta hai |
|-------|---------------------|
| `accounts` | Users: email, password ka hash, naam, role |
| `sessions` | Kaun kab login hua (logout pe band) |
| `profiles` | Skills, bio, resume (har account ka ek) |
| `user_settings` | Dashboard ke settings toggles |
| `companies` | Companies ki info |
| `jobs` | Job posts: title, salary, location, status |
| `applications` | Kis seeker ne kis job pe apply kiya + status |
| `saved_jobs` | Bookmark ki hui jobs |
| `password_reset_tokens`, `email_verification_tokens` | Future features ke liye bane hain |

**Relationships:**
- Ek recruiter → bohot si jobs (1 : N)
- Ek company → bohot si jobs (1 : N)
- Seekers ↔ Jobs = M : N, `applications` table ke through
- Account ↔ Profile = 1 : 1 (naya account banate hi **trigger** khud profile aur settings bana deta hai)

---

## 7. Login system kaise kaam karta hai

Hum ne apna login system khud banaya hai (Supabase Auth use nahi kiya):

1. **Signup:** password ko **scrypt** se hash karke save karte hain. Asli password kahin save nahi hota.
2. **Login:** password match ho to server ek **JWT token** banata hai aur use **httpOnly cookie** mein rakh deta hai (7 din valid). JavaScript is cookie ko chura nahi sakti.
3. Har request pe server cookie check karta hai, aur `sessions` table mein dekhta hai ke session abhi bhi valid hai.
4. **Logout:** session ko revoke kar dete hain aur cookie mita dete hain.

---

## 8. Security (viva mein zaroor poochte hain)

| Khatra | Hum ne kya kiya |
|--------|-----------------|
| Database leak ho jaye | Passwords hashed hain, asli password nahi milega |
| Koi doosre ka data padhe | Private tables pe **RLS** + `REVOKE`. Public key se sirf active jobs aur companies padh sakte ho |
| SQL Injection | supabase-js values ko parameter bana ke bhejta hai, aur search text saaf kiya jata hai |
| Seeker apna status "hired" kar de | Server check karta hai, sirf us job ka recruiter status badal sakta hai (warna 403 error) |
| Ek job pe do baar apply | Database mein **unique index** (job + applicant) |
| Secret keys GitHub pe chali jayen | `.env.local` `.gitignore` mein hai. Keys sirf Netlify settings mein hain |

---

## 9. Project apne computer pe kaise chalayein

```bash
git clone https://github.com/ALIRAZA4278/work-oura
cd work-oura
npm install
# .env.example ko copy karke .env.local banao aur keys daalo (group leader se lo)
npm run dev
# browser mein http://localhost:3000 kholo
```

`.env.local` mein ye 5 cheezein chahiye:

| Variable | Kya hai |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project ka URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (publishable) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key: **kisi ko share mat karo** |
| `AUTH_SECRET` | Login tokens sign karne ka random secret (32+ characters) |
| `NEXT_PUBLIC_APP_URL` | Website ka address |

---

## 10. Deployment

- Code **GitHub** pe hai → **Netlify** use build karta hai (`npm run build`) → website live.
- Netlify pe upar wale 5 environment variables set hain.
- Database ek dafa `sql/schema.sql` chala ke bana tha (Supabase SQL Editor mein).

---

## 11. Abhi kya kaam nahi karta (honest list)

- **Apply karne pe recruiter ko email:** code mojood hai, lekin Gmail ke credentials (`NM_EMAIL_USER`, `NM_EMAIL_PW`) set nahi hain. Is liye email nahi jati. Application phir bhi save ho jati hai.
- **Forgot password / email verify:** tables bane hue hain, lekin pages abhi nahi bane.

---

## 12. Viva ke common sawal

- **Project kya karta hai?** Job seekers aur recruiters ko jodne wala job board. Recruiter job post karta hai, seeker apply karta hai, recruiter status update karta hai.
- **Frontend aur backend kya hain?** Dono Next.js mein. `src/app/*` ke pages frontend hain, `src/app/api/*` backend hai.
- **Database kaunsa hai aur kyun?** PostgreSQL (Supabase). Relational data hai (users ↔ jobs ↔ applications), is liye tables aur foreign keys best hain.
- **Password kaise save hota hai?** scrypt hash + random salt. Asli password save nahi hota.
- **Login kaise yaad rehta hai?** JWT token httpOnly cookie mein, aur `sessions` table mein record.
- **Browser seedha database se kyun nahi baat karta?** Taake secret key aur private data server pe hi rahe.
- **Trigger ka example?** Naya account banne pe `profiles` aur `user_settings` ki row khud ban jati hai. `updated_at` bhi trigger se update hota hai.
- **M:N relationship kahan hai?** Seekers ↔ Jobs, `applications` table ke through (do foreign keys).
- **Hosting kahan hai?** Website Netlify pe, database Supabase pe, code GitHub pe.
