# Job Posting Platform - Architecture (PPT Version)

## 1. System Overview

```mermaid
graph TB
    User[👤 Users<br/>Job Seekers & Recruiters]

    subgraph "Frontend"
        UI[Next.js 15 + React 19<br/>Tailwind CSS]
    end

    subgraph "Authentication"
        Auth[Clerk Auth]
    end

    subgraph "Backend"
        API[Next.js API Routes]
    end

    subgraph "Database"
        DB[(MongoDB Atlas)]
    end

    subgraph "Services"
        Email[Email Service<br/>Gmail SMTP]
    end

    User --> UI
    UI --> Auth
    UI --> API
    API --> DB
    API --> Email
    Auth -.syncs.-> DB

    style User fill:#4A90E2
    style UI fill:#50E3C2
    style Auth fill:#F5A623
    style API fill:#7ED321
    style DB fill:#BD10E0
    style Email fill:#FF6B6B
```

## 2. Application Architecture

```mermaid
graph LR
    subgraph "Pages"
        Home[🏠 Home]
        Jobs[💼 Jobs]
        Dashboard[📊 Dashboard]
    end

    subgraph "API Layer"
        JobAPI[Jobs API]
        AppAPI[Applications API]
        UserAPI[Users API]
    end

    subgraph "Database"
        Users[(Users)]
        JobsDB[(Jobs)]
        Apps[(Applications)]
    end

    Home --> JobAPI
    Jobs --> JobAPI
    Dashboard --> JobAPI
    Dashboard --> AppAPI

    JobAPI --> JobsDB
    AppAPI --> Apps
    UserAPI --> Users

    JobsDB -.ref.-> Users
    Apps -.ref.-> JobsDB
    Apps -.ref.-> Users
```

## 3. Tech Stack

```mermaid
graph TD
    subgraph "Frontend"
        A[Next.js 15]
        B[React 19]
        C[Tailwind CSS]
        D[Ant Design]
    end

    subgraph "Backend"
        E[Next.js API]
        F[Mongoose]
    end

    subgraph "Infrastructure"
        G[MongoDB Atlas]
        H[Clerk Auth]
        I[Vercel]
    end

    A --> E
    E --> F
    F --> G
    A --> H
```

## 4. User Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database

    User->>Frontend: Browse Jobs
    Frontend->>API: GET /api/jobs
    API->>Database: Fetch Jobs
    Database-->>API: Jobs Data
    API-->>Frontend: Return Jobs
    Frontend-->>User: Display Jobs

    User->>Frontend: Apply to Job
    Frontend->>API: POST /api/applications
    API->>Database: Save Application
    Database-->>API: Success
    API-->>User: Email Confirmation
```

## 5. Database Schema

```mermaid
erDiagram
    USER ||--o{ JOB : posts
    USER ||--o{ APPLICATION : submits
    JOB ||--o{ APPLICATION : has

    USER {
        string clerkId
        string email
        string name
        enum role
        object profile
    }

    JOB {
        string title
        string company
        string location
        number salary
        array skills
        objectId recruiter
    }

    APPLICATION {
        objectId job
        objectId applicant
        string status
        date appliedAt
    }
```

## 6. Features

```mermaid
mindmap
    root((Job Portal))
        Job Seekers
            Browse Jobs
            Apply Jobs
            Track Applications
            Save Jobs
        Recruiters
            Post Jobs
            Manage Applications
            View Analytics
            Update Status
        Common
            Authentication
            Profile Management
            Email Notifications
            Search & Filter
```

## 7. Security & Auth

```mermaid
graph TD
    Request[User Request] --> Middleware{Clerk<br/>Middleware}

    Middleware -->|✅ Authenticated| Protected[Protected Routes]
    Middleware -->|❌ Guest| Public[Public Routes]

    Protected --> RoleCheck{Role?}

    RoleCheck -->|Job Seeker| Seeker[Apply Jobs<br/>View Applications]
    RoleCheck -->|Recruiter| Recruiter[Post Jobs<br/>Manage Apps]
    RoleCheck -->|Admin| Admin[Full Access]

    Public --> Pages[Home, Jobs List]
```

---

## Quick Stats

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 15 + React 19 |
| **Styling** | Tailwind CSS + Ant Design |
| **Backend** | Next.js API Routes |
| **Database** | MongoDB Atlas |
| **Auth** | Clerk |
| **Deployment** | Vercel |
| **Email** | Gmail SMTP |

## Key Features

✅ Job Posting & Management
✅ Application Tracking System
✅ Role-Based Access (Job Seeker, Recruiter)
✅ Email Notifications
✅ Advanced Search & Filters
✅ Responsive Design
✅ Real-time Application Status

---

**Platform Type**: Full-Stack Job Portal
**Architecture**: Monolithic Next.js App
**Deployment**: Cloud-Based (Vercel + MongoDB Atlas)
