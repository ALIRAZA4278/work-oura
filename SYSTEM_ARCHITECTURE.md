# Job Posting Platform - System Architecture

## High-Level System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "Frontend - Next.js 15 App"
        Pages[Pages/Routes]
        Components[React Components]
        ClientAuth[Clerk Auth Provider]

        Pages --> |uses| Components
        Pages --> |protected by| ClientAuth
    end

    subgraph "Middleware Layer"
        RouteGuard[Clerk Middleware<br/>Route Protection]
    end

    subgraph "Backend - API Routes"
        JobsAPI[/api/jobs]
        AppsAPI[/api/applications]
        UsersAPI[/api/users]
        DashAPI[/api/dashboard]
        CompAPI[/api/companies]
        WebhookAPI[/api/webhooks/clerk]
        EmailAPI[/api/apply]
    end

    subgraph "External Services"
        Clerk[Clerk Auth Service<br/>clerk.com]
        EmailService[Email Services<br/>Gmail SMTP/Web3Forms]
    end

    subgraph "Database Layer"
        MongoDB[(MongoDB Atlas)]

        subgraph "Collections"
            Users[Users Collection]
            Jobs[Jobs Collection]
            Applications[Applications Collection]
            Companies[Companies Collection]
        end
    end

    Browser --> Pages
    Mobile --> Pages
    Pages --> RouteGuard
    RouteGuard --> JobsAPI
    RouteGuard --> AppsAPI
    RouteGuard --> UsersAPI
    RouteGuard --> DashAPI
    RouteGuard --> CompAPI

    ClientAuth <--> Clerk
    WebhookAPI <--> Clerk

    JobsAPI --> MongoDB
    AppsAPI --> MongoDB
    UsersAPI --> MongoDB
    DashAPI --> MongoDB
    CompAPI --> MongoDB
    WebhookAPI --> Users

    AppsAPI --> EmailAPI
    EmailAPI --> EmailService

    MongoDB --> Users
    MongoDB --> Jobs
    MongoDB --> Applications
    MongoDB --> Companies

    Users -.references.-> Jobs
    Jobs -.references.-> Applications
    Applications -.references.-> Users
```

## Detailed Component Architecture

```mermaid
graph LR
    subgraph "Frontend Pages"
        Home[Home Page<br/>/]
        JobList[Job Listings<br/>/jobs]
        JobDetail[Job Detail<br/>/jobs/id]
        Dashboard[Dashboard<br/>/dashboard]
        SignIn[Sign In<br/>/sign-in]
        Companies[Companies<br/>/companies]
    end

    subgraph "Shared Components"
        Navbar[Navbar Component]
        JobCard[Job Card]
        Filters[Job Filters]
        Modal[Job Post Modal]
        Footer[Footer]
    end

    subgraph "Features"
        Search[Search & Filter]
        Apply[Application System]
        JobMgmt[Job Management]
        Profile[Profile Management]
    end

    Home --> Navbar
    JobList --> Navbar
    JobList --> JobCard
    JobList --> Filters
    JobDetail --> Apply
    Dashboard --> Modal
    Dashboard --> JobMgmt

    JobCard --> Search
    Filters --> Search
    Apply --> Profile
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant ClerkUI
    participant ClerkAPI
    participant Webhook
    participant MongoDB

    User->>Browser: Navigate to /sign-up
    Browser->>ClerkUI: Load Sign Up Form
    User->>ClerkUI: Fill & Submit Form
    ClerkUI->>ClerkAPI: Create User Account
    ClerkAPI-->>ClerkUI: Return JWT Token
    ClerkAPI->>Webhook: user.created event
    Webhook->>Webhook: Verify Svix Signature
    Webhook->>MongoDB: Create User Document
    MongoDB-->>Webhook: User Created
    ClerkUI-->>Browser: Redirect to Dashboard
    Browser->>User: Show Authenticated UI
```

## Job Application Flow

```mermaid
sequenceDiagram
    participant JobSeeker
    participant Frontend
    participant Clerk
    participant API
    participant DB
    participant Email

    JobSeeker->>Frontend: Click "Apply Now"
    Frontend->>Clerk: Verify Authentication
    Clerk-->>Frontend: User Authenticated
    Frontend->>JobSeeker: Show Application Form
    JobSeeker->>Frontend: Submit Application
    Frontend->>API: POST /api/applications
    API->>DB: Check Duplicate Application
    DB-->>API: No Duplicate Found
    API->>DB: Create Application Document
    DB-->>API: Application Created
    API->>DB: Update Job's Applications Array
    API->>Email: Send Notification Emails
    Email-->>API: Emails Sent
    API-->>Frontend: Success Response
    Frontend->>JobSeeker: Show Confirmation
```

## Job Posting Flow (Recruiter)

```mermaid
sequenceDiagram
    participant Recruiter
    participant Dashboard
    participant Clerk
    participant JobsAPI
    participant MongoDB

    Recruiter->>Dashboard: Click "Post New Job"
    Dashboard->>Clerk: Verify Role & Auth
    Clerk-->>Dashboard: Authenticated Recruiter
    Dashboard->>Recruiter: Show Job Post Modal
    Recruiter->>Dashboard: Fill Job Details
    Recruiter->>Dashboard: Submit Form
    Dashboard->>JobsAPI: POST /api/jobs
    JobsAPI->>MongoDB: Find/Create User
    JobsAPI->>MongoDB: Create Job Document
    MongoDB-->>JobsAPI: Job Created with ID
    JobsAPI-->>Dashboard: Success Response
    Dashboard->>Recruiter: Redirect to Dashboard
```

## Database Schema Relationships

```mermaid
erDiagram
    USER ||--o{ JOB : posts
    USER ||--o{ APPLICATION : submits
    USER {
        string clerkId PK
        string email UK
        string name
        enum role
        object profile
        object company
        array savedJobs
        object settings
    }

    JOB ||--o{ APPLICATION : receives
    JOB {
        objectId _id PK
        string jobTitle
        string companyName
        string jobDescription
        string jobType
        string experienceLevel
        array requiredSkills
        string location
        number salaryMin
        number salaryMax
        date deadline
        objectId recruiter FK
        array applications
        number views
    }

    APPLICATION {
        objectId _id PK
        objectId job FK
        objectId applicant FK
        string coverLetter
        string resume
        enum status
        string name
        string email
        date appliedAt
    }

    COMPANY {
        objectId _id PK
        string name
        string industry
        string location
        number openPositions
    }
```

## Technology Stack

```mermaid
graph TD
    subgraph "Frontend Stack"
        Next[Next.js 15.4.1]
        React[React 19]
        Tailwind[Tailwind CSS 4]
        Framer[Framer Motion]
        AntD[Ant Design 5.26]
        RHF[React Hook Form]
        Zod[Zod Validation]
    end

    subgraph "Backend Stack"
        NextAPI[Next.js API Routes]
        Mongoose[Mongoose ODM]
        Nodemailer[Nodemailer]
        Axios[Axios HTTP]
    end

    subgraph "Infrastructure"
        MongoDB[MongoDB Atlas]
        ClerkAuth[Clerk Authentication]
        Vercel[Vercel Hosting]
    end

    Next --> React
    Next --> NextAPI
    React --> Tailwind
    React --> Framer
    React --> AntD
    React --> RHF
    RHF --> Zod
    NextAPI --> Mongoose
    NextAPI --> Nodemailer
    Mongoose --> MongoDB
    Next --> ClerkAuth
```

## API Endpoints Architecture

```mermaid
graph TB
    subgraph "Public APIs"
        GetJobs[GET /api/jobs<br/>List & Filter Jobs]
        GetJobDetail[GET /api/jobs/id<br/>Job Details + View Count]
        GetCompanies[GET /api/companies<br/>List Companies]
    end

    subgraph "Protected APIs - Job Seeker"
        ApplyJob[POST /api/applications<br/>Submit Application]
        GetMyApps[GET /api/applications<br/>My Applications]
        UpdateProfile[PUT /api/users/me<br/>Update Profile]
    end

    subgraph "Protected APIs - Recruiter"
        PostJob[POST /api/jobs<br/>Create Job]
        UpdateJob[PUT /api/jobs/id<br/>Update Job]
        DeleteJob[DELETE /api/jobs/id<br/>Delete Job]
        GetDashboard[GET /api/dashboard<br/>Recruiter Jobs]
        UpdateAppStatus[PATCH /api/applications/id<br/>Update Status]
    end

    subgraph "System APIs"
        ClerkWebhook[POST /api/webhooks/clerk<br/>User Sync]
        SendEmail[POST /api/apply<br/>Send Emails]
    end

    GetJobs --> MongoDB[(MongoDB)]
    GetJobDetail --> MongoDB
    ApplyJob --> MongoDB
    PostJob --> MongoDB
    UpdateJob --> MongoDB
    DeleteJob --> MongoDB
    GetDashboard --> MongoDB
    ClerkWebhook --> MongoDB

    ApplyJob --> SendEmail
    SendEmail --> EmailSvc[Email Service]
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        DNS[Domain Name]
        CDN[Vercel CDN/Edge Network]

        subgraph "Vercel Platform"
            NextApp[Next.js Application<br/>Server + Static]
            API[API Routes<br/>Serverless Functions]
        end

        subgraph "External Services"
            MongoCloud[MongoDB Atlas Cloud<br/>Database Cluster]
            ClerkCloud[Clerk Cloud<br/>Auth Service]
            SMTP[Gmail SMTP<br/>Email Delivery]
        end
    end

    DNS --> CDN
    CDN --> NextApp
    NextApp --> API
    API --> MongoCloud
    NextApp --> ClerkCloud
    API --> ClerkCloud
    API --> SMTP
```

## Security Architecture

```mermaid
graph TD
    Request[Incoming Request] --> Middleware{Clerk Middleware}

    Middleware -->|Authenticated| CheckRole{Role Check}
    Middleware -->|Unauthenticated| Public[Public Routes<br/>/, /jobs, /companies]

    CheckRole -->|Job Seeker| JobSeekerRoutes[/api/applications<br/>/api/users/me]
    CheckRole -->|Recruiter| RecruiterRoutes[/api/jobs CRUD<br/>/dashboard<br/>/api/applications/id]
    CheckRole -->|Admin| AdminRoutes[Full Access]

    Public --> Response[Response]
    JobSeekerRoutes --> Validate{Validate Ownership}
    RecruiterRoutes --> Validate
    AdminRoutes --> Response

    Validate -->|Authorized| Response
    Validate -->|Unauthorized| Error[401/403 Error]
```

## Data Flow - Job Search & Apply

```mermaid
graph LR
    subgraph "User Actions"
        A[User Opens /jobs]
        B[Apply Filters]
        C[Search Keywords]
        D[Click Job Card]
        E[Click Apply]
    end

    subgraph "Frontend Processing"
        F[Build Query Params]
        G[API Call GET /jobs]
        H[Display Results]
        I[Show Job Detail]
        J[Application Form]
    end

    subgraph "Backend Processing"
        K[Parse Filters]
        L[MongoDB Query]
        M[Pagination]
        N[Increment Views]
        O[Create Application]
        P[Send Emails]
    end

    A --> F
    B --> F
    C --> F
    F --> G
    G --> K
    K --> L
    L --> M
    M --> H
    H --> D
    D --> I
    I --> N
    I --> E
    E --> J
    J --> O
    O --> P
```

---

## Key Architectural Decisions

### 1. **Monolithic Next.js App Router**
- Single codebase for frontend + backend
- Server-side rendering for SEO
- API routes as serverless functions

### 2. **Clerk for Authentication**
- Managed auth service (OAuth, email/password)
- Webhook-based user sync to MongoDB
- JWT-based session management

### 3. **MongoDB as Primary Database**
- Document-based flexible schema
- Easy to scale with embedded documents
- Atlas cloud for managed hosting

### 4. **Role-Based Access Control**
- Three roles: job_seeker, recruiter, admin
- Middleware-level route protection
- API-level authorization checks

### 5. **Email Notifications**
- Dual provider setup (Gmail SMTP + Web3Forms)
- Application confirmations
- Recruiter notifications

### 6. **Responsive Design First**
- Mobile-optimized UI
- Tailwind CSS for utility-first styling
- Framer Motion for smooth interactions

---

## Performance Considerations

- **Pagination**: Jobs API supports page/limit parameters
- **Lean Queries**: MongoDB queries use `.lean()` for better performance
- **Connection Pooling**: Cached MongoDB connections
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Dynamic imports for large components
- **Edge Caching**: Vercel CDN for static assets

## Scalability Roadmap

1. **Phase 1 (Current)**: Monolithic app, single MongoDB instance
2. **Phase 2**: Separate API service, Redis caching
3. **Phase 3**: Microservices (Jobs, Applications, Users)
4. **Phase 4**: Event-driven architecture with message queues

---

**Last Updated**: November 2025
**Version**: 1.0
**Architecture Status**: Production Ready
