# 📚 Job Posting Platform - Complete Project Documentation

> **Yeh documentation har cheez ko detail mein explain karti hai - har file, har folder, har feature. Agar aap programming nahi jaante, phir bhi aapko samajh aa jayega yeh project kaise kaam karta hai.**

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Folder Structure](#folder-structure)
4. [Database Models](#database-models)
5. [API Endpoints](#api-endpoints)
6. [Features Explained](#features-explained)
7. [File-by-File Explanation](#file-by-file-explanation)
8. [How Data Flows](#how-data-flows)
9. [User Journey](#user-journey)
10. [Setup & Installation](#setup--installation)

---

## 🎯 Project Overview

### **Yeh Project Kya Hai?**

Yeh ek **Job Posting aur Application Platform** hai jahan:
- **Recruiters** (Companies) job post kar sakte hain
- **Job Seekers** jobs dekh kar apply kar sakte hain
- **Dono** apna dashboard dekh sakte hain jahan unka data show hota hai

### **Main Features:**

1. **Job Posting** - Companies naye jobs create kar sakti hain
2. **Job Search** - Users jobs search kar sakte hain with filters
3. **Application Submission** - Users jobs par apply kar sakte hain
4. **Dashboard** - Har user ka personal dashboard jahan:
   - Job seekers apne applications dekh sakte hain
   - Recruiters apni posted jobs dekh sakte hain
5. **Profile Management** - Users apni profile update kar sakte hain
6. **Authentication** - Secure login/signup using Clerk

---

## 💻 Technology Stack

### **Frontend (Jo User Dekhta Hai)**

#### **1. Next.js 15.4.1**
- **Kya Hai?** Modern web framework for React
- **Kyu Use Kiya?**
  - Fast performance
  - Server-side rendering (pages jaldi load hote hain)
  - Easy routing (pages banana simple hai)
  - Built-in API support

#### **2. React 19.1.0**
- **Kya Hai?** JavaScript library for building user interfaces
- **Kyu Use Kiya?**
  - Component-based (reusable parts)
  - Interactive UI banane mein best
  - Large community support

#### **3. Tailwind CSS 4**
- **Kya Hai?** Utility-first CSS framework
- **Kyu Use Kiya?**
  - Fast styling without writing custom CSS
  - Responsive design easily
  - Modern look and feel

#### **4. Framer Motion 12.23.6**
- **Kya Hai?** Animation library
- **Kyu Use Kiya?** Smooth animations and transitions for better UX

#### **5. Ant Design (antd) 5.26.5**
- **Kya Hai?** UI component library
- **Kyu Use Kiya?** Ready-made beautiful components

#### **6. Lucide React 0.525.0**
- **Kya Hai?** Icon library
- **Kyu Use Kiya?** Beautiful, consistent icons throughout the app

---

### **Backend (Server-Side)**

#### **1. MongoDB (via Mongoose 8.3.4)**
- **Kya Hai?** NoSQL database
- **Kyu Use Kiya?**
  - Flexible data structure
  - Fast queries
  - Scalable
  - JSON-like documents (easy to work with)

#### **2. Mongoose**
- **Kya Hai?** MongoDB object modeling for Node.js
- **Kyu Use Kiya?**
  - Easy database operations
  - Schema validation
  - Built-in type casting

---

### **Authentication (Login/Signup)**

#### **@clerk/nextjs 6.25.4**
- **Kya Hai?** Complete authentication solution
- **Kyu Use Kiya?**
  - Ready-made login/signup forms
  - Secure user management
  - Social login support (Google, GitHub, etc.)
  - Session management
  - No need to build authentication from scratch

---

### **Email Service**

#### **1. Resend 4.7.0**
- **Kya Hai?** Email sending service
- **Kyu Use Kiya?** Send application emails to recruiters

#### **2. Nodemailer 7.0.5**
- **Kya Hai?** Backup email service
- **Kyu Use Kiya?** Alternative email sending option

---

### **Other Important Libraries**

#### **1. React Hook Form 7.60.0**
- **Kya Hai?** Form handling library
- **Kyu Use Kiya?** Easy form validation and management

#### **2. Zod 4.0.5**
- **Kya Hai?** Schema validation library
- **Kyu Use Kiya?** Validate data before saving to database

#### **3. React Hot Toast 2.5.2**
- **Kya Hai?** Notification library
- **Kyu Use Kiya?** Show success/error messages to users

#### **4. Axios 1.10.0**
- **Kya Hai?** HTTP client
- **Kyu Use Kiya?** Make API calls from frontend

---

## 📁 Folder Structure

```
my-app/
├── 📁 src/                          # Main source code folder
│   ├── 📁 app/                      # Next.js App Router (pages & APIs)
│   │   ├── 📁 api/                  # Backend API routes
│   │   │   ├── 📁 applications/     # Application-related APIs
│   │   │   ├── 📁 apply/            # Job apply email API
│   │   │   ├── 📁 companies/        # Company-related APIs
│   │   │   ├── 📁 dashboard/        # Dashboard data API
│   │   │   ├── 📁 jobs/             # Job-related APIs
│   │   │   ├── 📁 users/            # User-related APIs
│   │   │   └── 📁 webhooks/         # Webhook handlers (Clerk events)
│   │   ├── 📁 about/                # About page
│   │   ├── 📁 companies/            # Companies listing page
│   │   ├── 📁 dashboard/            # User dashboard page
│   │   ├── 📁 jobs/                 # Jobs pages
│   │   │   └── 📁 [id]/             # Individual job detail page
│   │   ├── layout.js                # Root layout (wraps all pages)
│   │   └── page.js                  # Home page
│   │
│   ├── 📁 components/               # Reusable UI components
│   │   ├── Footer.js                # Footer component
│   │   ├── JobCard.js               # Job listing card
│   │   ├── JobFilters.js            # Job filter sidebar
│   │   ├── JobPostModal.js          # Modal for posting new jobs
│   │   └── Navbar.js                # Navigation bar
│   │
│   ├── 📁 models/                   # Database models (schemas)
│   │   ├── Application.js           # Application data structure
│   │   ├── Company.js               # Company data structure
│   │   ├── Job.js                   # Job data structure
│   │   └── User.js                  # User data structure
│   │
│   ├── 📁 lib/                      # Utility functions
│   │   ├── email.js                 # Email sending functions
│   │   └── mongodb.js               # Database connection
│   │
│   └── 📁 middleware.js             # Clerk authentication middleware
│
├── 📁 public/                       # Static files (images, icons, etc.)
├── 📄 .env.local                    # Environment variables (secrets)
├── 📄 package.json                  # Project dependencies
├── 📄 next.config.js                # Next.js configuration
├── 📄 tailwind.config.js            # Tailwind CSS configuration
└── 📄 README.md                     # Project readme

```

---

## 🗄️ Database Models

### **1. User Model** (`src/models/User.js`)

**Purpose:** Store user information

**Fields:**
```javascript
{
  clerkId: String,          // Unique ID from Clerk authentication
  email: String,            // User's email
  name: String,             // User's full name
  role: String,             // "job_seeker", "recruiter", or "admin"

  profile: {
    phone: String,          // Phone number
    bio: String,            // Professional bio
    skills: [String],       // Array of skills
    experience: String,     // Work experience
    education: String,      // Educational background
    resume: String,         // Resume file URL
    location: String,       // City, Country
    website: String,        // Personal website
    linkedin: String,       // LinkedIn profile
    github: String          // GitHub profile
  },

  company: {
    name: String,           // Company name (for recruiters)
    description: String,    // Company description
    website: String,        // Company website
    logo: String,           // Company logo URL
    location: String,       // Company location
    industry: String,       // Industry type
    size: String            // Company size
  },

  savedJobs: [ObjectId],    // Array of saved job IDs

  settings: {
    emailNotifications: Boolean,  // Email notification preference
    jobAlerts: Boolean,          // Job alert preference
    profileVisibility: Boolean,  // Profile visibility
    twoFactorAuth: Boolean       // 2FA enabled or not
  },

  createdAt: Date,          // Account creation date
  updatedAt: Date           // Last update date
}
```

**Example:**
```javascript
{
  clerkId: "user_123abc",
  email: "ali@example.com",
  name: "Ali Raza",
  role: "job_seeker",
  profile: {
    phone: "+92 300 1234567",
    bio: "Full Stack Developer with 3 years experience",
    skills: ["React", "Node.js", "MongoDB"],
    location: "Lahore, Pakistan"
  },
  settings: {
    emailNotifications: true,
    jobAlerts: true,
    profileVisibility: false,
    twoFactorAuth: false
  }
}
```

---

### **2. Job Model** (`src/models/Job.js`)

**Purpose:** Store job postings

**Fields:**
```javascript
{
  userId: String,           // Clerk ID of poster
  jobTitle: String,         // Job title (e.g., "Senior React Developer")
  companyName: String,      // Company name
  companyLogo: String,      // Logo image URL
  jobDescription: String,   // Full job description
  jobType: String,          // "Full-time", "Part-time", "Contract", etc.
  experienceLevel: String,  // "Junior", "Mid", "Senior"
  category: String,         // Job category (e.g., "Software Development")
  requiredSkills: [String], // Array of required skills
  location: String,         // Job location
  salaryMin: Number,        // Minimum salary (PKR)
  salaryMax: Number,        // Maximum salary (PKR)
  deadline: Date,           // Application deadline
  isTestRequired: Boolean,  // Is test/assessment required?
  openings: Number,         // Number of positions
  contactEmail: String,     // Contact email for applications
  recruiter: ObjectId,      // Reference to User (MongoDB _id)
  applications: [ObjectId], // Array of application IDs
  createdAt: Date          // Job posting date
}
```

**Example:**
```javascript
{
  jobTitle: "Senior Full Stack Developer",
  companyName: "Tech Solutions Inc",
  jobDescription: "We are looking for...",
  jobType: "Full-time",
  experienceLevel: "Senior",
  category: "Software Development",
  requiredSkills: ["React", "Node.js", "PostgreSQL"],
  location: "Karachi, Pakistan",
  salaryMin: 150000,
  salaryMax: 250000,
  openings: 2,
  contactEmail: "hr@techsolutions.com",
  isTestRequired: true
}
```

---

### **3. Application Model** (`src/models/Application.js`)

**Purpose:** Store job applications

**Fields:**
```javascript
{
  job: ObjectId,            // Reference to Job
  applicant: ObjectId,      // Reference to User (MongoDB _id)
  coverLetter: String,      // Cover letter text
  resume: String,           // Resume file name
  customFields: Object,     // Additional custom data

  // Application details (denormalized for quick access)
  name: String,             // Applicant name
  email: String,            // Applicant email
  phone: String,            // Phone number
  skills: String,           // Skills (comma-separated)
  bio: String,              // Short bio
  education: String,        // Education details
  jobTitle: String,         // Applied job title (cached)
  companyName: String,      // Company name (cached)
  location: String,         // Job location (cached)

  status: String,           // "pending", "reviewing", "interview", "rejected", "hired"
  appliedAt: Date,          // Application submission date
  applicantScore: Number,   // Optional scoring
  createdAt: Date          // Same as appliedAt
}
```

**Example:**
```javascript
{
  job: "64a1b2c3d4e5f6...",
  applicant: "64b2c3d4e5f6g7...",
  name: "Ali Raza",
  email: "ali@example.com",
  phone: "+92 300 1234567",
  skills: "React, Node.js, MongoDB",
  coverLetter: "I am excited to apply...",
  status: "pending",
  jobTitle: "Senior Full Stack Developer",
  companyName: "Tech Solutions Inc"
}
```

---

### **4. Company Model** (`src/models/Company.js`)

**Purpose:** Store company information

**Fields:**
```javascript
{
  name: String,             // Company name
  description: String,      // Company description
  logo: String,             // Logo URL
  website: String,          // Company website
  location: String,         // Headquarters location
  industry: String,         // Industry type
  size: String,             // Company size (e.g., "50-100 employees")
  founded: Number,          // Year founded
  jobs: [ObjectId],         // Array of job IDs posted by company
  createdAt: Date          // Company profile creation date
}
```

---

## 🔌 API Endpoints

### **User APIs** (`/api/users`)

#### **GET /api/users**
- **Purpose:** Get current user's profile
- **Authentication:** Required (Clerk)
- **Returns:** User object
- **Used By:** Dashboard page to load user data

#### **POST /api/users**
- **Purpose:** Create new user profile
- **Authentication:** Required (Clerk)
- **Body:** User data (name, email, role, etc.)
- **Returns:** Created user object
- **Used By:** Webhook when user signs up

#### **PUT /api/users**
- **Purpose:** Update user profile
- **Authentication:** Required (Clerk)
- **Body:** Updated fields (profile, settings, etc.)
- **Returns:** Updated user object
- **Used By:** Profile page when user saves changes

---

### **Job APIs** (`/api/jobs`)

#### **GET /api/jobs**
- **Purpose:** Get all jobs (with filters)
- **Authentication:** Optional
- **Query Parameters:**
  - `page` - Page number (default: 1)
  - `limit` - Jobs per page (default: 10)
  - `search` - Search keyword
  - `location` - Filter by location
  - `type` - Filter by job type
  - `level` - Filter by experience level
  - `category` - Filter by category
  - `salaryMin` - Minimum salary
  - `salaryMax` - Maximum salary
  - `postedDate` - Filter by posting date
  - `sort` - Sort order (recent, oldest, salary_high, salary_low)
- **Returns:**
  ```javascript
  {
    jobs: [...],
    pagination: {
      page: 1,
      limit: 10,
      total: 50,
      pages: 5
    }
  }
  ```
- **Used By:** Jobs page

#### **POST /api/jobs**
- **Purpose:** Create new job posting
- **Authentication:** Required (Clerk)
- **Body:** Job details
- **Returns:** Created job object
- **Used By:** Job post modal on dashboard

#### **GET /api/jobs/[id]**
- **Purpose:** Get single job details
- **Authentication:** Optional
- **Returns:** Job object with full details
- **Used By:** Job detail page

#### **PUT /api/jobs/[id]**
- **Purpose:** Update existing job
- **Authentication:** Required (must be job owner)
- **Body:** Updated job fields
- **Returns:** Updated job object
- **Used By:** Edit job modal on dashboard

#### **DELETE /api/jobs/[id]**
- **Purpose:** Delete job posting
- **Authentication:** Required (must be job owner)
- **Returns:** Success message
- **Used By:** Delete button on dashboard

---

### **Application APIs** (`/api/applications`)

#### **GET /api/applications**
- **Purpose:** Get applications
  - For job seekers: Returns their applications
  - For recruiters: Returns applications for their jobs
- **Authentication:** Required (Clerk)
- **Query Parameters:**
  - `jobId` - Filter by specific job (optional)
- **Returns:** Array of application objects
- **Used By:** Dashboard applications tab

#### **POST /api/applications**
- **Purpose:** Submit new job application
- **Authentication:** Required (Clerk, must be job_seeker)
- **Body:**
  ```javascript
  {
    jobId: "...",
    coverLetter: "...",
    resume: "resume.pdf",
    customFields: {
      name: "...",
      email: "...",
      phone: "...",
      skills: "...",
      bio: "...",
      education: "..."
    }
  }
  ```
- **Returns:** Created application object
- **Used By:** Job detail page application form

---

### **Dashboard API** (`/api/dashboard`)

#### **GET /api/dashboard**
- **Purpose:** Get user's posted jobs
- **Authentication:** Required (Clerk)
- **Returns:** Array of jobs posted by current user
- **Used By:** Dashboard "My Jobs" tab

---

### **Apply API** (`/api/apply`)

#### **POST /api/apply**
- **Purpose:** Send application email to recruiter
- **Authentication:** None (public endpoint)
- **Body:**
  ```javascript
  {
    to: "hr@company.com",
    subject: "New Application for Job Title",
    from_name: "Ali Raza",
    from_email: "ali@example.com",
    message: "HTML email content..."
  }
  ```
- **Returns:** Success/failure status
- **Used By:** Job detail page after application submission

---

### **Company API** (`/api/companies`)

#### **GET /api/companies**
- **Purpose:** Get all companies
- **Authentication:** Optional
- **Returns:** Array of company objects
- **Used By:** Companies page

---

### **Webhook API** (`/api/webhooks/clerk`)

#### **POST /api/webhooks/clerk**
- **Purpose:** Handle Clerk events (user created, updated, deleted)
- **Authentication:** Clerk webhook signature verification
- **Used By:** Clerk service (automatic)
- **Events Handled:**
  - `user.created` - Create user in database
  - `user.updated` - Update user in database
  - `user.deleted` - Delete user from database

---

## ✨ Features Explained

### **1. Authentication System**

**How It Works:**

1. **User Sign Up:**
   - User clicks "Sign Up"
   - Clerk modal opens
   - User enters email/password or uses Google/GitHub
   - Clerk creates account
   - Webhook fires → User created in MongoDB
   - User redirected to home page

2. **User Login:**
   - User clicks "Sign In"
   - Clerk modal opens
   - User enters credentials
   - Clerk validates and creates session
   - User can access protected pages

3. **Session Management:**
   - Clerk manages session cookies
   - Middleware (`src/middleware.js`) checks authentication on protected routes
   - If not authenticated → Redirect to sign-in page

**Protected Routes:**
- `/dashboard` - Requires login
- `/api/users` - Requires login
- `/api/applications` - Requires login
- `/api/jobs` POST/PUT/DELETE - Requires login

---

### **2. Job Posting System**

**Step-by-Step Flow:**

1. **Recruiter Opens Dashboard**
   - Clicks "Post Job" button
   - Modal opens with job posting form

2. **Fills Job Details:**
   - Job Title (e.g., "React Developer")
   - Company Name
   - Company Logo URL
   - Job Description
   - Job Type (Full-time/Part-time/Contract/Internship)
   - Experience Level (Junior/Mid/Senior)
   - Category (Software Development, Design, etc.)
   - Required Skills (comma-separated)
   - Location
   - Salary Range (Min & Max)
   - Application Deadline
   - Number of Openings
   - Contact Email
   - Is Test Required? (Yes/No)

3. **Submits Form:**
   - Frontend validates data
   - POST request to `/api/jobs`
   - Backend:
     - Gets user from Clerk ID
     - Creates user in DB if not exists
     - Creates job document
     - Links job to user
     - Returns success

4. **Job Appears:**
   - In "My Jobs" tab on dashboard
   - In public jobs listing page
   - Searchable by anyone

---

### **3. Job Search & Filtering**

**Available Filters:**

1. **Search Bar:**
   - Searches in: Job Title, Company Name, Description, Skills
   - Case-insensitive
   - Real-time filtering

2. **Location Filter:**
   - Enter city/country
   - Shows matching jobs

3. **Job Type Filter:**
   - Full-time
   - Part-time
   - Contract
   - Internship
   - Remote

4. **Experience Level:**
   - Junior
   - Mid
   - Senior

5. **Category:**
   - Software Development
   - Design
   - Marketing
   - Sales
   - HR
   - Finance
   - (and more)

6. **Salary Range:**
   - Min & Max sliders
   - Shows jobs within range

7. **Posted Date:**
   - Today
   - Last 3 days
   - Last week
   - Last month

8. **Sort Options:**
   - Most Recent
   - Oldest First
   - Highest Salary
   - Lowest Salary
   - Alphabetical

**How It Works:**

1. User selects filters
2. Frontend updates URL query parameters
3. API receives filters
4. MongoDB query built with filters
5. Results returned and displayed

---

### **4. Job Application System**

**Complete Flow:**

1. **User Browses Jobs:**
   - Goes to `/jobs` page
   - Sees list of available jobs
   - Clicks on a job

2. **Views Job Detail:**
   - Full job description
   - Required skills
   - Salary range
   - Company info
   - "Apply Now" button

3. **Clicks Apply:**
   - If not logged in → Shows error message
   - If logged in → Opens application modal

4. **Fills Application Form:**
   - **Personal Info:**
     - Full Name (auto-filled from Clerk)
     - Email (auto-filled from Clerk)
     - Phone Number
     - Education

   - **Professional Info:**
     - Skills (comma-separated)
     - Resume Upload (PDF/DOC/DOCX)
     - Bio/Summary

   - **Application Details:**
     - Cover Letter (required)

5. **Submits Application:**
   - Frontend validates all fields
   - Two API calls made:

     **a) Save to Database:**
     - POST to `/api/applications`
     - Creates application document
     - Links to job and user
     - Status set to "pending"

     **b) Send Email:**
     - POST to `/api/apply`
     - Email sent to recruiter's contact email
     - Contains all application details

6. **Success:**
   - Success modal shown
   - Application saved in database
   - Email delivered to recruiter
   - Application appears in user's dashboard

---

### **5. Dashboard System**

**For Job Seekers:**

#### **Overview Tab:**
- **Stats Cards:**
  - Total Applications
  - In Review (status = 'reviewing')
  - Interviews (status = 'interview')
  - My Jobs (if they posted any)

- **Quick Actions:**
  - Post New Job
  - Find Candidates
  - Analytics

#### **Applications Tab:**
- **Filter Dropdown:**
  - All Applications
  - Pending
  - Reviewing
  - Interview
  - Hired
  - Rejected

- **Application Cards:**
  - Job Title
  - Company Name
  - Location
  - Application Date
  - Status Badge (with color coding)
  - More Options Menu

#### **Jobs Tab:**
- Shows jobs posted by user
- Each job card shows:
  - Job Title
  - Company Name
  - Location
  - Posted Date
  - Salary Range
  - Number of Applications
  - Status (Active)
  - Action Buttons:
    - View (👁️ Eye icon)
    - Edit (✏️ Edit icon)
    - Delete (🗑️ Trash icon)

#### **Profile Tab:**
- **Profile Information Section:**
  - First Name (disabled - managed by Clerk)
  - Last Name (disabled - managed by Clerk)
  - Email (disabled - managed by Clerk)
  - Role Selector (Job Seeker/Recruiter/Admin)
  - Professional Bio (textarea)
  - Location
  - Phone Number
  - Save Changes button
  - Cancel button

- **Profile Sidebar:**
  - Profile Picture (initials avatar)
  - Account Stats:
    - Applications Count
    - Jobs Posted
    - Hired Count
    - Success Rate (calculated)
  - Quick Settings:
    - Email Notifications (toggle)
    - Job Alerts (toggle)
    - Profile Visibility (toggle)
    - Two-Factor Auth (toggle)

---

**For Recruiters:**

Same layout but:
- Applications tab shows applications for THEIR jobs
- My Jobs shows jobs they posted
- Can see applicant details
- Can change application status

---

### **6. Profile Management**

**What Users Can Update:**

1. **Role:**
   - Job Seeker
   - Recruiter
   - Admin

2. **Professional Bio:**
   - Summary of experience
   - Career goals
   - Specializations

3. **Location:**
   - City, Country

4. **Phone Number:**
   - Contact number

5. **Settings:**
   - Email Notifications
   - Job Alerts
   - Profile Visibility
   - Two-Factor Authentication

**How Updates Work:**

1. User changes values in form
2. Clicks "Save Changes"
3. Loading spinner shows
4. PUT request to `/api/users`
5. MongoDB updates user document
6. Success toast notification
7. Data refreshes

**Cancel Functionality:**

1. User clicks "Cancel"
2. Form values reset to original
3. No API call made
4. Info toast shown

---

## 📂 File-by-File Explanation

### **Root Files**

#### **`package.json`**
**Purpose:** Project configuration and dependencies

**What It Contains:**
- Project name and version
- Scripts (dev, build, start, lint)
- Dependencies (libraries used)
- Dev dependencies (development tools)

**Key Scripts:**
```json
{
  "dev": "next dev --turbopack",      // Start development server
  "build": "next build",               // Build for production
  "start": "next start",               // Start production server
  "lint": "next lint"                  // Check code quality
}
```

---

#### **`next.config.js`**
**Purpose:** Next.js configuration

**Contains:**
- Image optimization settings
- API routes configuration
- Environment variable handling
- Build optimizations

---

#### **`tailwind.config.js`**
**Purpose:** Tailwind CSS configuration

**Contains:**
- Theme colors
- Font families
- Screen breakpoints
- Custom utilities

---

#### **`.env.local`**
**Purpose:** Environment variables (secrets)

**Contains:**
```
MONGODB_URI=mongodb+srv://...           # Database connection
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...  # Clerk public key
CLERK_SECRET_KEY=...                    # Clerk secret key
RESEND_API_KEY=...                      # Email service key
```

⚠️ **Important:** This file is NOT committed to Git (contains secrets)

---

### **`src/app/` - Pages**

#### **`src/app/layout.js`**
**Purpose:** Root layout that wraps all pages

**What It Does:**
- Imports global CSS
- Sets up Clerk provider (authentication)
- Defines HTML structure
- Adds Toaster for notifications

**Code Flow:**
```javascript
export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>
          {children}           {/* All pages render here */}
          <Toaster />          {/* Toast notifications */}
        </body>
      </html>
    </ClerkProvider>
  )
}
```

---

#### **`src/app/page.js`**
**Purpose:** Home page (landing page)

**What It Shows:**
- Hero section with tagline
- Featured jobs
- Company logos
- Call-to-action buttons

**Key Features:**
- Server-side rendering (fast load)
- Responsive design
- Animation on scroll

---

#### **`src/app/jobs/page.js`**
**Purpose:** Jobs listing page

**What It Does:**

1. **Fetches Jobs:**
   - Calls `/api/jobs` with filters
   - Gets paginated results

2. **Shows Filters:**
   - JobFilters component (sidebar)
   - Search bar
   - Filter options

3. **Displays Jobs:**
   - JobCard component for each job
   - Grid layout
   - Loading state
   - Empty state if no jobs

4. **Pagination:**
   - Previous/Next buttons
   - Page numbers
   - Items per page selector

**State Management:**
```javascript
const [jobs, setJobs] = useState([])           // Job list
const [loading, setLoading] = useState(true)   // Loading state
const [filters, setFilters] = useState({})     // Active filters
const [page, setPage] = useState(1)            // Current page
```

---

#### **`src/app/jobs/[id]/page.js`**
**Purpose:** Individual job detail page

**URL Format:** `/jobs/64a1b2c3d4e5f6...`

**What It Shows:**

1. **Job Header:**
   - Company logo
   - Job title
   - Company name
   - Location, job type, salary

2. **Job Details:**
   - Full description
   - Required skills (badges)
   - Experience level
   - Category
   - Posted date
   - Application deadline

3. **Sidebar:**
   - Quick job info
   - Contact email
   - Apply button

4. **Application Modal:**
   - Multi-step form
   - File upload
   - Validation
   - Submit button

**How Apply Works:**

1. User fills form
2. Validates all fields
3. Creates application object
4. **Two parallel operations:**
   - Saves to database (`POST /api/applications`)
   - Sends email (`POST /api/apply`)
5. Shows success modal
6. Resets form

---

#### **`src/app/dashboard/page.js`**
**Purpose:** User dashboard

**Authentication:** Required (redirects to login if not authenticated)

**State Management:**
```javascript
const [activeTab, setActiveTab] = useState("overview")
const [jobs, setJobs] = useState([])
const [applications, setApplications] = useState([])
const [userProfile, setUserProfile] = useState(null)
const [profileData, setProfileData] = useState({...})
const [settings, setSettings] = useState({...})
const [applicationFilter, setApplicationFilter] = useState("all")
const [showFilterMenu, setShowFilterMenu] = useState(false)
```

**Functions:**

1. **`fetchUserProfile()`**
   - Gets user data from `/api/users`
   - Loads profile and settings
   - Updates state

2. **`fetchDashboardData()`**
   - Gets applications from `/api/applications`
   - Gets jobs from `/api/dashboard`
   - Updates state

3. **`handleSaveProfile()`**
   - Validates profile data
   - PUT to `/api/users`
   - Shows success/error toast
   - Refreshes data

4. **`toggleSetting(settingKey)`**
   - Updates setting state
   - PUT to `/api/users`
   - Saves to database
   - Shows toast notification

5. **`handleViewJob(jobId)`**
   - Redirects to `/jobs/[id]`

6. **`handleEditJob(jobId)`**
   - Finds job in state
   - Opens edit modal
   - Pre-fills form

7. **`handleDeleteJob(jobId)`**
   - Shows confirmation
   - DELETE to `/api/jobs/[id]`
   - Updates state
   - Shows toast

**Tab Content:**

1. **Overview:**
   - 4 stat cards
   - Quick action buttons

2. **Applications:**
   - Filter dropdown
   - Application cards
   - Empty state

3. **My Jobs:**
   - Post job button
   - Job cards
   - Action buttons

4. **Profile:**
   - Profile form
   - Profile sidebar
   - Account stats
   - Quick settings

---

#### **`src/app/about/page.js`**
**Purpose:** About page

**What It Shows:**
- Company information
- Mission statement
- Team members
- Contact info

---

#### **`src/app/companies/page.js`**
**Purpose:** Companies listing page

**What It Does:**
- Fetches companies from `/api/companies`
- Displays company cards
- Shows company info:
  - Logo
  - Name
  - Description
  - Location
  - Industry
  - Number of jobs

---

### **`src/app/api/` - API Routes**

#### **`src/app/api/users/route.js`**

**GET Handler:**
```javascript
export async function GET() {
  // 1. Get Clerk user ID
  const { userId } = await auth()

  // 2. Check authentication
  if (!userId) return 401 error

  // 3. Connect to database
  await connectToDB()

  // 4. Find user by Clerk ID
  const user = await User.findOne({ clerkId: userId })

  // 5. Return user data
  return user
}
```

**POST Handler:**
```javascript
export async function POST(request) {
  // 1. Get Clerk user ID
  const { userId } = await auth()

  // 2. Check authentication
  if (!userId) return 401 error

  // 3. Connect to database
  await connectToDB()

  // 4. Get request body
  const body = await request.json()

  // 5. Check if user exists
  const existingUser = await User.findOne({ clerkId: userId })
  if (existingUser) return 400 error

  // 6. Create new user
  const user = new User({ ...body, clerkId: userId })
  await user.save()

  // 7. Return created user
  return user
}
```

**PUT Handler:**
```javascript
export async function PUT(request) {
  // 1. Get Clerk user ID
  const { userId } = await auth()

  // 2. Check authentication
  if (!userId) return 401 error

  // 3. Connect to database
  await connectToDB()

  // 4. Get update data
  const body = await request.json()

  // 5. Update user
  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    body,
    { new: true }  // Return updated document
  )

  // 6. Return updated user
  return user
}
```

---

#### **`src/app/api/jobs/route.js`**

**GET Handler (with filters):**
```javascript
export async function GET(request) {
  // 1. Parse URL query parameters
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page')) || 1
  const limit = parseInt(searchParams.get('limit')) || 10

  // 2. Build filter object
  const filter = {}

  // Search filter
  if (searchParams.get('search')) {
    filter.$or = [
      { jobTitle: { $regex: search, $options: 'i' } },
      { companyName: { $regex: search, $options: 'i' } },
      // ... more fields
    ]
  }

  // Location filter
  if (searchParams.get('location')) {
    filter.location = { $regex: location, $options: 'i' }
  }

  // ... more filters

  // 3. Calculate pagination
  const skip = (page - 1) * limit
  const total = await Job.countDocuments(filter)

  // 4. Fetch jobs
  const jobs = await Job.find(filter)
    .populate('recruiter', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  // 5. Return with pagination info
  return {
    jobs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  }
}
```

**POST Handler:**
```javascript
export async function POST(request) {
  // 1. Get request body
  const body = await request.json()

  // 2. Find/create user
  let user = await User.findOne({ clerkId: body.recruiter })
  if (!user) {
    user = await User.create({
      clerkId: body.recruiter,
      email: body.contactEmail,
      name: body.companyName,
      role: 'recruiter'
    })
  }

  // 3. Create job
  const job = await Job.create({
    ...body,
    recruiter: user._id  // Link to user's MongoDB _id
  })

  // 4. Return created job
  return job
}
```

---

#### **`src/app/api/jobs/[id]/route.js`**

**GET Handler:**
```javascript
export async function GET(request, { params }) {
  // 1. Get job ID from URL
  const { id } = params

  // 2. Find job and populate recruiter
  const job = await Job.findById(id)
    .populate('recruiter', 'name email')

  // 3. Return job
  return job
}
```

**PUT Handler:**
```javascript
export async function PUT(request, { params }) {
  // 1. Get job ID and update data
  const { id } = params
  const body = await request.json()

  // 2. Update job
  const job = await Job.findByIdAndUpdate(
    id,
    body,
    { new: true }
  )

  // 3. Return updated job
  return job
}
```

**DELETE Handler:**
```javascript
export async function DELETE(request, { params }) {
  // 1. Get job ID
  const { id } = params

  // 2. Delete job
  await Job.findByIdAndDelete(id)

  // 3. Return success
  return { message: 'Job deleted' }
}
```

---

#### **`src/app/api/applications/route.js`**

**GET Handler:**
```javascript
export async function GET(request) {
  // 1. Get user
  const { userId } = await auth()
  const user = await User.findOne({ clerkId: userId })

  // 2. Build query based on role
  let query = {}

  if (user.role === "job_seeker") {
    // Get user's applications
    query.applicant = user._id
  } else if (user.role === "recruiter") {
    // Get applications for recruiter's jobs
    const recruiterJobs = await Job.find({ recruiter: user._id })
    query.job = { $in: recruiterJobs.map(job => job._id) }
  }

  // 3. Fetch applications
  const applications = await Application.find(query)
    .populate("job", "jobTitle companyName location jobType")
    .populate("applicant", "name email profile")
    .sort({ appliedAt: -1 })

  // 4. Return applications
  return applications
}
```

**POST Handler:**
```javascript
export async function POST(request) {
  // 1. Get user
  const { userId } = await auth()
  const user = await User.findOne({ clerkId: userId })

  // 2. Check if job seeker
  if (user.role !== "job_seeker") {
    return 403 error
  }

  // 3. Get request body
  const body = await request.json()

  // 4. Check if already applied
  const existingApplication = await Application.findOne({
    job: body.jobId,
    applicant: user._id
  })
  if (existingApplication) return 400 error

  // 5. Get job details (for caching)
  const jobDetails = await Job.findById(body.jobId)

  // 6. Create application
  const application = new Application({
    job: body.jobId,
    applicant: user._id,
    coverLetter: body.coverLetter,
    resume: body.resume,
    customFields: body.customFields,
    // Cached fields
    name: body.customFields?.name || user.name,
    email: body.customFields?.email || user.email,
    phone: body.customFields?.phone,
    skills: body.customFields?.skills,
    bio: body.customFields?.bio,
    education: body.customFields?.education,
    jobTitle: jobDetails?.jobTitle,
    companyName: jobDetails?.companyName,
    location: jobDetails?.location
  })

  await application.save()

  // 7. Add to job's applications array
  await Job.findByIdAndUpdate(body.jobId, {
    $push: { applications: application._id }
  })

  // 8. Return populated application
  return await Application.findById(application._id)
    .populate("job", "jobTitle companyName location jobType")
    .populate("applicant", "name email profile")
}
```

---

#### **`src/app/api/dashboard/route.js`**

**Purpose:** Get jobs posted by current user

```javascript
export async function GET() {
  // 1. Get user
  const { userId } = await auth()
  const recruiter = await User.findOne({ clerkId: userId })

  // 2. Find user's jobs
  const jobs = await Job.find({ recruiter: recruiter._id })
    .sort({ createdAt: -1 })

  // 3. Return jobs
  return jobs
}
```

---

#### **`src/app/api/apply/route.js`**

**Purpose:** Send application email using Resend

```javascript
export async function POST(req) {
  // 1. Get request body
  const { to, subject, from_name, from_email, message } = await req.json()

  // 2. Validate required fields
  if (!to || !subject || !from_name || !from_email || !message) {
    return 400 error
  }

  // 3. Send email using Resend
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject,
    html: `
      <h2>New Job Application</h2>
      <p><strong>Job:</strong> ${subject}</p>
      <p><strong>Applicant Name:</strong> ${from_name}</p>
      <p><strong>Applicant Email:</strong> ${from_email}</p>
      <pre>${message}</pre>
    `
  })

  // 4. Return success
  return { success: true }
}
```

---

#### **`src/app/api/companies/route.js`**

**GET Handler:**
```javascript
export async function GET() {
  // 1. Connect to database
  await connectToDB()

  // 2. Fetch all companies
  const companies = await Company.find()
    .sort({ createdAt: -1 })

  // 3. Return companies
  return companies
}
```

---

#### **`src/app/api/webhooks/clerk/route.js`**

**Purpose:** Handle Clerk webhook events

**Events:**
- `user.created` - User signed up
- `user.updated` - User updated profile
- `user.deleted` - User deleted account

```javascript
export async function POST(req) {
  // 1. Verify webhook signature (security)
  const svix = new Svix(process.env.CLERK_WEBHOOK_SECRET)
  const payload = await req.text()
  const headers = req.headers

  const verified = svix.verify(payload, headers)
  if (!verified) return 400 error

  // 2. Parse event
  const { type, data } = JSON.parse(payload)

  // 3. Handle event type
  switch (type) {
    case 'user.created':
      // Create user in MongoDB
      await User.create({
        clerkId: data.id,
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        role: 'job_seeker'
      })
      break

    case 'user.updated':
      // Update user in MongoDB
      await User.findOneAndUpdate(
        { clerkId: data.id },
        {
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`
        }
      )
      break

    case 'user.deleted':
      // Delete user from MongoDB
      await User.findOneAndDelete({ clerkId: data.id })
      break
  }

  // 4. Return success
  return { success: true }
}
```

---

### **`src/components/` - Reusable Components**

#### **`src/components/Navbar.js`**

**Purpose:** Top navigation bar

**What It Shows:**
- Logo/Brand name
- Navigation links:
  - Home
  - Jobs
  - Companies
  - About
  - Dashboard (if logged in)
- User menu (if logged in):
  - Profile
  - Settings
  - Sign Out
- Sign In/Sign Up buttons (if not logged in)

**Clerk Integration:**
```javascript
const { user, isSignedIn } = useUser()

{isSignedIn ? (
  <UserButton afterSignOutUrl="/" />  // Clerk's user menu
) : (
  <SignInButton mode="modal">
    <button>Sign In</button>
  </SignInButton>
)}
```

---

#### **`src/components/Footer.js`**

**Purpose:** Footer section

**What It Shows:**
- Company info
- Quick links
- Social media icons
- Copyright notice

---

#### **`src/components/JobCard.js`**

**Purpose:** Job listing card (reusable)

**Props:**
```javascript
{
  job: {
    _id,
    jobTitle,
    companyName,
    companyLogo,
    location,
    jobType,
    salaryMin,
    salaryMax,
    requiredSkills,
    createdAt
  }
}
```

**What It Shows:**
- Company logo
- Job title
- Company name
- Location
- Job type badge
- Salary range
- Skills tags
- Posted date
- Apply button

**Click Handler:**
```javascript
const handleClick = () => {
  router.push(`/jobs/${job._id}`)
}
```

---

#### **`src/components/JobFilters.js`**

**Purpose:** Filter sidebar for jobs page

**State:**
```javascript
const [filters, setFilters] = useState({
  search: '',
  location: '',
  type: [],
  level: [],
  category: '',
  salaryMin: 0,
  salaryMax: 500000,
  postedDate: ''
})
```

**What It Shows:**

1. **Search Input**
2. **Location Input**
3. **Job Type Checkboxes:**
   - Full-time
   - Part-time
   - Contract
   - Internship
   - Remote
4. **Experience Level:**
   - Junior
   - Mid
   - Senior
5. **Category Dropdown**
6. **Salary Range Sliders**
7. **Posted Date Radio:**
   - Today
   - Last 3 days
   - Last week
   - Last month
8. **Clear Filters Button**

**How It Works:**
```javascript
const handleFilterChange = (key, value) => {
  setFilters({ ...filters, [key]: value })
  onFilterChange({ ...filters, [key]: value })  // Pass to parent
}
```

---

#### **`src/components/JobPostModal.js`**

**Purpose:** Modal for posting/editing jobs

**Props:**
```javascript
{
  open: Boolean,           // Show/hide modal
  onClose: Function,       // Close handler
  onSubmit: Function,      // Form submit handler
  recruiterId: String,     // Clerk user ID
  userId: String,          // Clerk user ID
  editJob: Object | null   // If editing, contains job data
}
```

**Form Fields:**

1. **Job Title**
2. **Company Name**
3. **Company Logo URL**
4. **Job Description** (textarea)
5. **Job Type** (select)
6. **Experience Level** (select)
7. **Category** (select)
8. **Required Skills** (comma-separated input)
9. **Location**
10. **Salary Min** (number)
11. **Salary Max** (number)
12. **Application Deadline** (date)
13. **Number of Openings** (number)
14. **Contact Email**
15. **Is Test Required?** (checkbox)

**Validation:**
- All required fields must be filled
- Email must be valid format
- Salary max > Salary min
- Deadline must be future date

**Submit Flow:**
```javascript
const handleSubmit = (e) => {
  e.preventDefault()

  // Get form data
  const formData = new FormData(e.target)

  // Build payload
  const payload = {
    userId: recruiterId,
    jobTitle: formData.get('jobTitle'),
    companyName: formData.get('companyName'),
    // ... all other fields
    requiredSkills: formData.get('requiredSkills').split(',').map(s => s.trim()),
    recruiter: recruiterId
  }

  // Call parent's onSubmit
  onSubmit(e, payload)
}
```

---

### **`src/models/` - Database Schemas**

All model files follow this pattern:

```javascript
import mongoose from 'mongoose'

const ModelSchema = new mongoose.Schema({
  // Field definitions
  fieldName: {
    type: String,      // Data type
    required: true,    // Validation
    unique: true,      // Constraint
    default: 'value'   // Default value
  }
})

// Middleware (hooks)
ModelSchema.pre('save', function(next) {
  // Runs before saving
  this.updatedAt = Date.now()
  next()
})

// Export
export default mongoose.models.Model || mongoose.model('Model', ModelSchema)
```

**Why `mongoose.models.Model ||` ?**
- Prevents model re-compilation in development
- Next.js hot-reloads, so model would be redefined
- This checks if model exists first

---

### **`src/lib/` - Utility Functions**

#### **`src/lib/mongodb.js`**

**Purpose:** Database connection utility

```javascript
import mongoose from 'mongoose'

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectToDB() {
  // If already connected, return existing connection
  if (cached.conn) {
    return cached.conn
  }

  // If not connected, create new connection
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    })
  }

  // Wait for connection
  cached.conn = await cached.promise
  return cached.conn
}

export default connectToDB
```

**Why Cache Connection?**
- Serverless functions (Next.js API routes) are stateless
- Creating new connection on every request is slow
- Caching reuses existing connection
- Improves performance

---

#### **`src/lib/email.js`**

**Purpose:** Email sending utilities

```javascript
import nodemailer from 'nodemailer'

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Send email function
export async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    })
    return { success: true }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error }
  }
}
```

---

#### **`src/middleware.js`**

**Purpose:** Clerk authentication middleware

```javascript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/users(.*)',
  '/api/applications(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // If route is protected, require authentication
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
```

**How It Works:**

1. Request comes in
2. Middleware checks if route is protected
3. If protected:
   - Checks if user is authenticated (has valid session)
   - If yes → Allow request
   - If no → Redirect to sign-in page
4. If not protected → Allow request

---

## 🔄 How Data Flows

### **Example 1: User Posts a Job**

```
1. User clicks "Post Job" button on dashboard
   ↓
2. JobPostModal opens
   ↓
3. User fills form and clicks submit
   ↓
4. Frontend validation runs
   ↓
5. POST request to /api/jobs
   ↓
6. Server (API route):
   - Gets user ID from Clerk
   - Validates data
   - Finds/creates user in MongoDB
   - Creates job document
   - Links job to user
   - Saves to database
   ↓
7. Response sent back to frontend
   ↓
8. Frontend:
   - Closes modal
   - Shows success toast
   - Refreshes job list
   ↓
9. New job appears in "My Jobs" tab
```

---

### **Example 2: User Applies to a Job**

```
1. User browsing jobs (/jobs page)
   ↓
2. Clicks on a job card
   ↓
3. Redirected to /jobs/[id]
   ↓
4. Page fetches job details (GET /api/jobs/[id])
   ↓
5. User clicks "Apply Now"
   ↓
6. If not logged in → Error message
   If logged in → Application modal opens
   ↓
7. User fills application form:
   - Personal info (auto-filled from Clerk)
   - Skills
   - Resume upload
   - Cover letter
   ↓
8. User clicks "Submit"
   ↓
9. Frontend validation
   ↓
10. TWO API calls made in parallel:

    A) POST /api/applications
       - Saves application to database
       - Links to job and user
       - Returns saved application

    B) POST /api/apply
       - Sends email to recruiter
       - Contains all application details
   ↓
11. Both complete successfully
   ↓
12. Frontend:
    - Closes application modal
    - Shows success modal
    - Resets form
   ↓
13. Application saved in database
    Email delivered to recruiter
    Application appears in user's dashboard
```

---

### **Example 3: User Updates Profile**

```
1. User goes to Dashboard → Profile tab
   ↓
2. Page loads:
   - Fetches user data (GET /api/users)
   - Populates form fields
   ↓
3. User changes:
   - Role: Job Seeker → Recruiter
   - Bio: "Full Stack Developer..."
   - Location: "Lahore, Pakistan"
   - Phone: "+92 300 1234567"
   ↓
4. User clicks "Save Changes"
   ↓
5. Frontend:
   - Sets saving state to true
   - Shows loading spinner
   ↓
6. PUT request to /api/users with:
   {
     role: "recruiter",
     profile: {
       bio: "Full Stack Developer...",
       location: "Lahore, Pakistan",
       phone: "+92 300 1234567"
     }
   }
   ↓
7. Server:
   - Gets user ID from Clerk
   - Finds user in MongoDB
   - Updates user document
   - Returns updated user
   ↓
8. Frontend:
   - Sets saving state to false
   - Hides loading spinner
   - Shows success toast
   - Refreshes user data
   ↓
9. Updated profile displayed
```

---

### **Example 4: User Filters Jobs**

```
1. User on /jobs page
   ↓
2. User selects filters:
   - Location: "Karachi"
   - Job Type: "Full-time"
   - Experience: "Senior"
   - Salary: 100000 - 200000
   ↓
3. Frontend updates URL:
   /jobs?location=Karachi&type=full-time&level=senior&salaryMin=100000&salaryMax=200000
   ↓
4. Page re-renders, fetches jobs with filters
   ↓
5. GET /api/jobs with query parameters
   ↓
6. Server:
   - Parses query parameters
   - Builds MongoDB filter object:
     {
       location: { $regex: 'Karachi', $options: 'i' },
       jobType: 'full-time',
       experienceLevel: 'senior',
       salaryMin: { $gte: 100000 },
       salaryMax: { $lte: 200000 }
     }
   - Executes database query
   - Returns matching jobs
   ↓
7. Frontend:
   - Receives filtered jobs
   - Updates job list
   - Shows count: "15 jobs found"
   ↓
8. User sees filtered results
```

---

## 👤 User Journey

### **Job Seeker Journey**

#### **1. Discovery**
```
User opens website
  ↓
Sees landing page with:
  - Hero section
  - Featured jobs
  - Search bar
  ↓
Clicks "Browse Jobs"
```

#### **2. Browse & Search**
```
Lands on /jobs page
  ↓
Sees all available jobs
  ↓
Uses filters:
  - Searches "React Developer"
  - Selects "Remote"
  - Sets salary range
  ↓
Finds interesting job
  ↓
Clicks job card
```

#### **3. Job Details**
```
Redirected to /jobs/[id]
  ↓
Reads full job description
  ↓
Checks requirements
  ↓
Decides to apply
  ↓
Clicks "Apply Now"
```

#### **4. Authentication** (if not logged in)
```
Sees error message: "Please log in"
  ↓
Clicks "Sign In"
  ↓
Clerk modal opens
  ↓
Signs up with email or Google
  ↓
Account created
  ↓
Redirected back to job page
```

#### **5. Application**
```
Clicks "Apply Now" again
  ↓
Application modal opens
  ↓
Fills form:
  - Name (auto-filled)
  - Email (auto-filled)
  - Phone
  - Skills
  - Uploads resume
  - Writes cover letter
  ↓
Clicks "Submit Application"
  ↓
Loading spinner shows
  ↓
Success modal appears
  ↓
Application submitted
```

#### **6. Track Applications**
```
Goes to Dashboard
  ↓
Clicks "Applications" tab
  ↓
Sees all submitted applications with statuses:
  - Pending
  - Reviewing
  - Interview
  - Hired
  - Rejected
  ↓
Filters by status
  ↓
Tracks progress
```

---

### **Recruiter Journey**

#### **1. Sign Up**
```
Clicks "Sign Up"
  ↓
Creates account
  ↓
Sets role to "Recruiter"
```

#### **2. Post Job**
```
Goes to Dashboard
  ↓
Clicks "Post New Job"
  ↓
Modal opens
  ↓
Fills job details:
  - Job title
  - Description
  - Requirements
  - Salary
  - etc.
  ↓
Clicks "Post Job"
  ↓
Job created
```

#### **3. Manage Jobs**
```
Dashboard → "My Jobs" tab
  ↓
Sees all posted jobs
  ↓
For each job sees:
  - Number of applications
  - Status (Active)
  ↓
Can:
  - View job
  - Edit job
  - Delete job
```

#### **4. Review Applications**
```
Dashboard → "Applications" tab
  ↓
Sees all applications for their jobs
  ↓
Each application shows:
  - Applicant name
  - Applied job
  - Status
  - Applied date
  ↓
Can filter by status
  ↓
Can change application status:
  - Pending → Reviewing
  - Reviewing → Interview
  - Interview → Hired/Rejected
```

---

## 🚀 Setup & Installation

### **Prerequisites**

Before starting, make sure you have:

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Check version: `node --version`

2. **MongoDB Account**
   - Sign up: https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Get connection string

3. **Clerk Account**
   - Sign up: https://clerk.com/
   - Create application
   - Get API keys

4. **Resend Account** (for emails)
   - Sign up: https://resend.com/
   - Get API key

---

### **Installation Steps**

#### **1. Clone/Download Project**
```bash
# If using Git
git clone <repository-url>
cd my-app

# Or download ZIP and extract
```

#### **2. Install Dependencies**
```bash
npm install
```

This will install all packages listed in `package.json`:
- Next.js
- React
- Tailwind CSS
- Mongoose
- Clerk
- All other libraries

#### **3. Environment Setup**

Create `.env.local` file in root directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobportal?retryWrites=true&w=majority

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...

# Optional: Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Job Portal <noreply@jobportal.com>"
```

**How to get these values:**

**MongoDB URI:**
1. Go to MongoDB Atlas
2. Click "Connect"
3. Select "Connect your application"
4. Copy connection string
5. Replace `<password>` with your password

**Clerk Keys:**
1. Go to Clerk Dashboard
2. Select your application
3. Go to "API Keys"
4. Copy publishable key and secret key

**Resend API Key:**
1. Go to Resend Dashboard
2. Click "API Keys"
3. Create new API key
4. Copy key

#### **4. Database Setup**

MongoDB will auto-create database and collections on first use. No manual setup needed!

#### **5. Run Development Server**
```bash
npm run dev
```

Server starts at: http://localhost:3000

#### **6. Build for Production**
```bash
npm run build
```

#### **7. Start Production Server**
```bash
npm start
```

---

## 🔧 Common Issues & Solutions

### **Issue 1: MongoDB Connection Error**

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
1. Check MongoDB URI in `.env.local`
2. Ensure IP address is whitelisted in MongoDB Atlas
3. Check internet connection

---

### **Issue 2: Clerk Authentication Not Working**

**Error:** `Clerk: Missing publishable key`

**Solution:**
1. Check `.env.local` has correct Clerk keys
2. Restart development server
3. Clear browser cache

---

### **Issue 3: Email Not Sending**

**Error:** `Failed to send email`

**Solution:**
1. Check Resend API key
2. Verify domain (if using custom domain)
3. Check email logs in Resend dashboard

---

## 📊 Database Collections

After running the app, MongoDB will have these collections:

### **users**
- Stores user profiles
- Indexed on: `clerkId`, `email`

### **jobs**
- Stores job postings
- Indexed on: `userId`, `recruiter`, `createdAt`

### **applications**
- Stores job applications
- Indexed on: `job`, `applicant`, `status`

### **companies**
- Stores company information
- Indexed on: `name`

---

## 🎨 Customization Guide

### **Change Theme Colors**

Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',      // Blue
        secondary: '#8B5CF6',    // Purple
        accent: '#10B981',       // Green
      }
    }
  }
}
```

---

### **Add New Job Category**

Edit `src/components/JobPostModal.js`:

```javascript
const categories = [
  'Software Development',
  'Design',
  'Marketing',
  'Sales',
  'YOUR_NEW_CATEGORY',  // Add here
]
```

---

### **Change Email Template**

Edit `src/app/api/apply/route.js`:

```javascript
html: `
  <!-- Your custom HTML email template -->
  <div style="font-family: Arial, sans-serif;">
    <h2>New Application</h2>
    <!-- ... -->
  </div>
`
```

---

## 📈 Scaling Considerations

### **For High Traffic:**

1. **Database:**
   - Upgrade MongoDB cluster
   - Add indexes on frequently queried fields
   - Use MongoDB aggregation for complex queries

2. **Caching:**
   - Implement Redis for session storage
   - Cache job listings
   - Use CDN for static assets

3. **File Storage:**
   - Use Cloudinary/S3 for resume uploads
   - Don't store files in MongoDB

4. **API Optimization:**
   - Implement rate limiting
   - Use pagination everywhere
   - Add API caching headers

---

## 🔐 Security Best Practices

1. **Never commit `.env.local`** ✅ Already in `.gitignore`
2. **Validate all inputs** ✅ Using Zod schemas
3. **Use HTTPS in production** ✅ Vercel provides SSL
4. **Sanitize user input** ✅ Mongoose schemas handle this
5. **Implement rate limiting** ⚠️ TODO
6. **Use CSP headers** ⚠️ TODO

---

## 📝 Summary

Yeh project ek complete **Job Posting aur Application Platform** hai jo:

✅ **Modern technologies** use karta hai (Next.js, React, MongoDB, Clerk)
✅ **Secure authentication** provide karta hai
✅ **Real-time data** show karta hai
✅ **Responsive design** hai (mobile + desktop)
✅ **Easy to customize** hai
✅ **Production-ready** hai

**Main Features:**
- Job posting by recruiters
- Job search with filters
- Application submission
- User dashboard
- Profile management
- Email notifications
- Analytics & statistics

**Technology Stack:**
- Frontend: Next.js 15, React 19, Tailwind CSS 4
- Backend: Node.js, MongoDB (Mongoose)
- Auth: Clerk
- Email: Resend
- Hosting: Vercel (recommended)

---

## 📞 Support

Agar koi question hai ya help chahiye:

1. Check documentation again
2. Search error on Google/Stack Overflow
3. Check GitHub issues
4. Ask in community forums

---

**Created with ❤️ by Ali Raza**

**Last Updated:** November 2025

---

